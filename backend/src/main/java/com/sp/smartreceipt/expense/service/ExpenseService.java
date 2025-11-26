package com.sp.smartreceipt.expense.service;

import com.sp.smartreceipt.category.entity.CategoryEntity;
import com.sp.smartreceipt.category.repository.CategoryRepository;
import com.sp.smartreceipt.error.exception.AccessDeniedException;
import com.sp.smartreceipt.error.exception.CategoryNotFoundException;
import com.sp.smartreceipt.error.exception.ExpenseNotFoundException;
import com.sp.smartreceipt.error.exception.UserNotFoundException;
import com.sp.smartreceipt.expense.dto.ExpenseFilterRequest;
import com.sp.smartreceipt.expense.entity.ExpenseEntity;
import com.sp.smartreceipt.expense.entity.ExpenseItemEntity;
import com.sp.smartreceipt.expense.repository.ExpenseRepository;
import com.sp.smartreceipt.expense.util.ExpenseSpecifications;
import com.sp.smartreceipt.model.*;
import com.sp.smartreceipt.user.entity.UserEntity;
import com.sp.smartreceipt.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseService {

        private final ExpenseRepository expenseRepository;

        private final UserRepository userRepository;

        private final CategoryRepository categoryRepository;

        @Transactional
        public ExpenseDetails addNewExpense(NewExpense newExpense) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String userEmail = authentication.getName();
                log.info("Adding new expense for user: {}", userEmail);

                ExpenseEntity expense = translateToEntity(newExpense);

                UserEntity currentUser = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new UserNotFoundException(userEmail));
                expense.setUser(currentUser);

                List<ExpenseItemEntity> expenseItems = newExpense.getItems().stream()
                                .map((item) -> translateToExpenseItemEntity(item, userEmail))
                                .toList();

                expenseItems.forEach(expense::addItem);

                expense = expenseRepository.save(expense);

                return translateToDetails(expense);
        }

        @Transactional(readOnly = true)
        public ExpenseDetails searchExpenseDetails(UUID expenseId, UUID categoryId) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String userEmail = authentication.getName();
                log.debug("Searching details for expense ID: {}", expenseId);

                ExpenseEntity expense = expenseRepository.findByExpenseIdWithItems(expenseId)
                                .orElseThrow(() -> new ExpenseNotFoundException(expenseId.toString(), userEmail));

                if (!expense.getUser().getEmail().equals(userEmail)) {
                        throw new AccessDeniedException(
                                "You do not have rights to see this expense with ID: " + expenseId);
                }

                if (categoryId != null) {
                    List<ExpenseItemEntity> filteredItems = expense.getItems().stream()
                            .filter(item -> item.getCategory().getCategoryId().equals(categoryId))
                            .toList();
                    expense.setItems(filteredItems);
                }

                return translateToDetails(expense);
        }

        @Transactional(readOnly = true)
        public ExpenseSummaryPage searchExpenses(ExpenseFilterRequest parameters) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String userEmail = authentication.getName();
                log.debug("Searching expenses for user: {} with params: {}", userEmail, parameters);

                Pageable pageable = PageRequest.of(
                                parameters.getPage(),
                                parameters.getSize(),
                                Sort.by(Sort.Direction.DESC, "transactionDate"));

                Specification<ExpenseEntity> spec = Specification
                                .where(ExpenseSpecifications.hasUser(userEmail))
                                .and(ExpenseSpecifications.inMonth(parameters.getYear(), parameters.getMonth()))
                                .and(ExpenseSpecifications.inCategory(parameters.getCategoryId()));

                Page<ExpenseEntity> pageResult = expenseRepository.findAll(spec, pageable);

                return translateToExpenseSummaryPage(pageResult);

        }

        @Transactional
        public void deleteExpense(UUID expenseId) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String userEmail = authentication.getName();
                log.info("Deleting expense ID: {} for user: {}", expenseId, userEmail);

                ExpenseEntity expense = expenseRepository.findByExpenseId(expenseId)
                                .orElseThrow(() -> new ExpenseNotFoundException(expenseId.toString(), userEmail));

                if (!expense.getUser().getEmail().equals(userEmail)) {
                        throw new AccessDeniedException(
                                        "You do not have rights to delete this expense with ID: " + expenseId);
                }

                expenseRepository.delete(expense);
        }

        @Transactional
        public ExpenseDetails updateExpense(UUID expenseId, NewExpense request) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String userEmail = authentication.getName();
                log.info("Updating expense ID: {} for user: {}", expenseId, userEmail);

                ExpenseEntity expense = expenseRepository.findByExpenseId(expenseId)
                                .orElseThrow(() -> new ExpenseNotFoundException(expenseId.toString(), userEmail));

                if (!expense.getUser().getEmail().equals(userEmail)) {
                        throw new AccessDeniedException(
                                        "You do not have rights to modify this expense with ID: " + expenseId);
                }

                expense.setDescription(request.getDescription());
                expense.setTransactionDate(request.getTransactionDate());

                expense.getItems().clear();

                request.getItems().forEach((item) -> {
                    expense.addItem(translateToExpenseItemEntity(item, userEmail));
                });

                expense.setTotalAmount(calculateTotal(expense));
                expense.setItemCount(expense.getItems().size());

                ExpenseEntity savedExpense = expenseRepository.save(expense);
                return translateToDetails(savedExpense);
        }

        public List<ExpenseEntity> getExpensesForMonth(Integer year, Integer month) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();

            YearMonth yearMonth = YearMonth.of(year, month);
            OffsetDateTime startOfMonth = yearMonth.atDay(1)
                    .atStartOfDay()
                    .atOffset(ZoneOffset.UTC);

            OffsetDateTime endOfMonth = yearMonth.atEndOfMonth()
                    .atTime(23, 59, 59, 999999999)
                    .atOffset(ZoneOffset.UTC);

            return expenseRepository.findAllByUserEmailAndTransactionDateBetween(userEmail, startOfMonth, endOfMonth);
        }

        private ExpenseEntity translateToEntity(NewExpense newExpense) {
                return ExpenseEntity.builder()
                                .expenseId(UUID.randomUUID())
                                .description(newExpense.getDescription())
                                .transactionDate(newExpense.getTransactionDate())
                                .totalAmount(calculateTotal(newExpense))
                                .itemCount(newExpense.getItems().size())
                                .items(new ArrayList<>())
                                .build();
        }

        private ExpenseDetails translateToDetails(ExpenseEntity expense) {
                return ExpenseDetails.builder()
                                .expenseId(expense.getExpenseId())
                                .description(expense.getDescription())
                                .transactionDate(expense.getTransactionDate())
                                .totalAmount(expense.getTotalAmount())
                                .itemCount(expense.getItemCount())
                                .items(expense.getItems().stream()
                                                .map(this::translateToExpenseItem)
                                                .toList())
                                .build();
        }

        private ExpenseSummaryPage translateToExpenseSummaryPage(Page<ExpenseEntity> page) {
                List<ExpenseSummary> expenses = page.getContent().stream().map(this::translateToExpenseSummary)
                                .toList();

                return ExpenseSummaryPage.builder()
                                .content(expenses)
                                .page(page.getNumber())
                                .totalPages(page.getTotalPages())
                                .size(page.getSize())
                                .totalElements((int) page.getTotalElements())
                                .build();
        }

        private ExpenseSummary translateToExpenseSummary(ExpenseEntity expense) {
                return ExpenseSummary.builder()
                                .expenseId(expense.getExpenseId())
                                .totalAmount(expense.getTotalAmount())
                                .description(expense.getDescription())
                                .transactionDate(expense.getTransactionDate())
                                .itemCount(expense.getItemCount())
                                .build();
        }

        private ExpenseItem translateToExpenseItem(ExpenseItemEntity item) {
                return ExpenseItem.builder()
                                .expenseItemId(item.getExpenseItemId())
                                .productName(item.getProductName())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .categoryId(item.getCategory().getCategoryId())
                                .categoryName(item.getCategory().getName())
                                .build();
        }

        private ExpenseItemEntity translateToExpenseItemEntity(NewExpenseItem item, String email) {
                CategoryEntity category = categoryRepository.findByCategoryIdAndUserEmail(item.getCategoryId(), email)
                                .orElseThrow(() -> new CategoryNotFoundException(item.getCategoryId().toString(),
                                                email));

                return ExpenseItemEntity.builder()
                                .expenseItemId(UUID.randomUUID())
                                .productName(item.getProductName())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .category(category)
                                .build();
        }

        private BigDecimal calculateTotal(NewExpense expense) {
                return expense.getItems().stream()
                                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        private BigDecimal calculateTotal(ExpenseEntity expense) {
                return expense.getItems().stream()
                                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
}
