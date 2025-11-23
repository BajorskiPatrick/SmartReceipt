package com.sp.smartreceipt.expense.service;

import com.sp.smartreceipt.category.repository.CategoryRepository;
import com.sp.smartreceipt.error.exception.*;
import com.sp.smartreceipt.expense.entity.ExpenseEntity;
import com.sp.smartreceipt.expense.entity.ExpenseItemEntity;
import com.sp.smartreceipt.expense.repository.ExpenseRepository;
import com.sp.smartreceipt.model.ExpenseItem;
import com.sp.smartreceipt.model.NewExpenseItem;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseItemService {

        private final ExpenseRepository expenseRepository;

        private final CategoryRepository categoryRepository;

        @Transactional
        public ExpenseItem updateExpenseItem(UUID expenseId, UUID itemId, NewExpenseItem request) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String userEmail = authentication.getName();
                log.info("Updating item ID: {} in expense ID: {}", itemId, expenseId);

                ExpenseEntity expense = expenseRepository.findByExpenseId(expenseId)
                                .orElseThrow(() -> new ExpenseNotFoundException(expenseId.toString(), userEmail));

                if (!expense.getUser().getEmail().equals(userEmail)) {
                        throw new AccessDeniedException(
                                        "Ypu have no rights to update content of this expense with ID: " + expenseId);
                }

                ExpenseItemEntity itemEntity = expense.getItems().stream()
                                .filter(item -> item.getExpenseItemId().equals(itemId))
                                .findFirst()
                                .orElseThrow(() -> new ExpenseItemNotFoundException(itemId.toString(), userEmail));

                var category = categoryRepository.findByCategoryIdAndUserEmail(request.getCategoryId(), userEmail)
                                .orElseThrow(() -> new CategoryNotFoundException(request.getCategoryId().toString(),
                                                userEmail));
                itemEntity.setCategory(category);

                itemEntity.setProductName(request.getProductName());
                itemEntity.setQuantity(request.getQuantity());
                itemEntity.setPrice(request.getPrice());

                recalculateTotal(expense);

                expenseRepository.save(expense);

                return mapToExpenseItemDto(itemEntity);
        }

        @Transactional
        public void deleteItem(UUID expenseId, UUID itemId) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String userEmail = authentication.getName();
                log.info("Deleting item ID: {} from expense ID: {}", itemId, expenseId);

                ExpenseEntity expense = expenseRepository.findByExpenseIdWithItems(expenseId)
                                .orElseThrow(() -> new ExpenseNotFoundException(expenseId.toString(), userEmail));

                if (!expense.getUser().getEmail().equals(userEmail)) {
                        throw new AccessDeniedException("You do not have rights to modify this expense ");
                }

                ExpenseItemEntity itemToRemove = expense.getItems().stream()
                                .filter(item -> item.getExpenseItemId().equals(itemId))
                                .findFirst()
                                .orElseThrow(() -> new ExpenseNotFoundException(expenseId.toString(), userEmail));

                expense.removeItem(itemToRemove);

                recalculateTotal(expense);

                expenseRepository.save(expense);
        }

        private ExpenseItem mapToExpenseItemDto(ExpenseItemEntity entity) {
                return ExpenseItem.builder()
                                .expenseItemId(entity.getExpenseItemId())
                                .productName(entity.getProductName())
                                .quantity(entity.getQuantity())
                                .price(entity.getPrice())
                                .categoryName(entity.getCategory().getName())
                                .categoryId(entity.getCategory().getCategoryId())
                                .build();
        }

        private void recalculateTotal(ExpenseEntity expense) {
                BigDecimal total = expense.getItems().stream()
                                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                expense.setTotalAmount(total);
                expense.setItemCount(expense.getItems().size());
        }
}
