package com.sp.smartreceipt.budget.service;

import com.sp.smartreceipt.budget.entity.MonthlyCategoryBudgetEntity;
import com.sp.smartreceipt.budget.entity.MonthlyBudgetEntity;
import com.sp.smartreceipt.budget.repository.BudgetRepository;
import com.sp.smartreceipt.category.entity.CategoryEntity;
import com.sp.smartreceipt.category.repository.CategoryRepository;
import com.sp.smartreceipt.error.exception.*;
import com.sp.smartreceipt.model.CategoryBudget;
import com.sp.smartreceipt.model.MonthlyBudget;
import com.sp.smartreceipt.model.NewCategoryBudget;
import com.sp.smartreceipt.model.NewMonthlyBudget;
import com.sp.smartreceipt.user.entity.UserEntity;
import com.sp.smartreceipt.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;

    private final UserRepository userRepository;

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public MonthlyBudget getMonthlyBudget(Integer year, Integer month) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        log.info("Fetching budget for {}-{} for user {}", year, month, userEmail);

        MonthlyBudgetEntity monthlyBudget = budgetRepository.findByYearAndMonthAndUserEmail(year, month, userEmail)
                .orElseThrow(() -> new BudgetNotFoundException(year, month, userEmail));

        return translateToMonthlyBudgetDto(monthlyBudget);
    }

    @Transactional
    public MonthlyBudget createNewBudget(NewMonthlyBudget newMonthlyBudget) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        log.info("Adding new budget for {}-{} user: {}", newMonthlyBudget.getYear(), newMonthlyBudget.getMonth(), userEmail);

        MonthlyBudgetEntity monthlyBudget = translateToMonthlyBudgetEntity(newMonthlyBudget);

        UserEntity currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException(userEmail));
        monthlyBudget.setUser(currentUser);

        List<MonthlyCategoryBudgetEntity> categoryBudgetEntities = newMonthlyBudget.getCategoryBudgets().stream()
                .map((item) -> translateToCategoryBudgetEntity(item, userEmail))
                .toList();

        categoryBudgetEntities.forEach(monthlyBudget::addCategoryBudget);

        try {
            monthlyBudget = budgetRepository.save(monthlyBudget);
            return translateToMonthlyBudgetDto(monthlyBudget);
        } catch (DataIntegrityViolationException e) {
            throw new BudgetAlreadyDefinedException(newMonthlyBudget.getYear().toString(), newMonthlyBudget.getMonth().toString(), userEmail);
        }
    }

    @Transactional
    public MonthlyBudget updateMonthlyBudget(UUID budgetId, NewMonthlyBudget newMonthlyBudget) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        MonthlyBudgetEntity monthlyBudget = budgetRepository.findByMonthlyBudgetIdAndUserEmail(budgetId, userEmail)
                .orElseThrow(() -> new BudgetNotFoundException(budgetId.toString(), userEmail));

        if (monthlyBudget.getYear().equals(newMonthlyBudget.getYear()) || monthlyBudget.getMonth().equals(newMonthlyBudget.getMonth())) {
            throw new BudgetYearAndMonthMismatch();
        }

        log.info("Updating monthly budget for {}-{} for user {}", monthlyBudget.getYear(), monthlyBudget.getMonth(), userEmail);

        monthlyBudget.setBudget(newMonthlyBudget.getBudget());

        monthlyBudget.getCategoryBudgets().clear();
        newMonthlyBudget.getCategoryBudgets().forEach((categoryBudget) -> {
                monthlyBudget.addCategoryBudget(translateToCategoryBudgetEntity(categoryBudget, userEmail));
            }
        );

        MonthlyBudgetEntity updatedBudget = budgetRepository.save(monthlyBudget);
        return translateToMonthlyBudgetDto(updatedBudget);
    }

    private MonthlyCategoryBudgetEntity translateToCategoryBudgetEntity(NewCategoryBudget categoryBudget, String email) {
        CategoryEntity category = categoryRepository.findByCategoryIdAndUserEmail(categoryBudget.getCategoryId(), email)
                .orElseThrow(() -> new CategoryNotFoundException(categoryBudget.getCategoryId().toString(),
                        email));

        return MonthlyCategoryBudgetEntity.builder()
                .categoryBudgetId(UUID.randomUUID())
                .category(category)
                .budget(categoryBudget.getBudget())
                .build();
    }

    private MonthlyBudgetEntity translateToMonthlyBudgetEntity(NewMonthlyBudget monthlyBudget) {
        return MonthlyBudgetEntity.builder()
                .monthlyBudgetId(UUID.randomUUID())
                .year(monthlyBudget.getYear())
                .month(monthlyBudget.getMonth())
                .budget(monthlyBudget.getBudget())
                .build();
    }

    private MonthlyBudget translateToMonthlyBudgetDto(MonthlyBudgetEntity monthlyBudget) {
        return MonthlyBudget.builder()
                .budgetId(monthlyBudget.getMonthlyBudgetId())
                .budget(monthlyBudget.getBudget())
                .year(monthlyBudget.getYear())
                .month(monthlyBudget.getMonth())
                .categoryBudgets(monthlyBudget.getCategoryBudgets().stream()
                        .map(this::translateToCategoryBudgetDto)
                        .toList()
                )
                .build();
    }

    private CategoryBudget translateToCategoryBudgetDto(MonthlyCategoryBudgetEntity categoryBudget) {
        return CategoryBudget.builder()
                .categoryBudgetId(categoryBudget.getCategoryBudgetId())
                .categoryId(categoryBudget.getCategory().getCategoryId())
                .categoryName(categoryBudget.getCategory().getName())
                .budget(categoryBudget.getBudget())
                .build();
    }
}
