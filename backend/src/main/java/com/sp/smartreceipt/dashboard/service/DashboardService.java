package com.sp.smartreceipt.dashboard.service;

import com.sp.smartreceipt.budget.entity.CategoryBudgetEntity;
import com.sp.smartreceipt.budget.entity.MonthlyBudgetEntity;
import com.sp.smartreceipt.budget.repository.BudgetRepository;
import com.sp.smartreceipt.category.service.CategoryService;
import com.sp.smartreceipt.expense.entity.ExpenseEntity;
import com.sp.smartreceipt.expense.service.ExpenseService;
import com.sp.smartreceipt.model.DashboardCategorySummaryItem;
import com.sp.smartreceipt.model.DashboardData;
import com.sp.smartreceipt.model.DashboardKpi;
import com.sp.smartreceipt.model.DashboardTrendItem;
import com.sp.smartreceipt.model.Category;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExpenseService expenseService;

    private final CategoryService categoryService;

    private final BudgetRepository budgetRepository;

    @Transactional
    public DashboardData getDashboardData(Integer year, Integer month) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        List<ExpenseEntity> thisMonthExpenses = expenseService.getExpensesForMonth(year, month);

        List<DashboardTrendItem> previousTrendItems = generateDashboardTrendItems(thisMonthExpenses, year, month);
        DashboardKpi  dashboardKpi = generateDashboardKpi(thisMonthExpenses, year, month, userEmail);
        List<DashboardCategorySummaryItem> categorySummary = generateCategorySummaryItems(thisMonthExpenses, year, month, userEmail);

        return DashboardData.builder()
            .kpi(dashboardKpi)
            .trendSummary(previousTrendItems)
            .categorySummary(categorySummary)
            .build();
    }

    private List<DashboardCategorySummaryItem> generateCategorySummaryItems(List<ExpenseEntity> expenses, Integer year, Integer month, String userEmail) {
        List<Category> categories = categoryService.fetchAllActiveCategories();
        List<CategoryBudgetEntity> categoryBudgets = budgetRepository.findByYearAndMonthAndUserEmail(year, month, userEmail)
                .map(MonthlyBudgetEntity::getCategoryBudgets)
                .orElse(new ArrayList<>());
        List<DashboardCategorySummaryItem> summaryItems = new ArrayList<>();

        categories.forEach(category -> {
            BigDecimal budget = categoryBudgets.stream()
                .filter(cb -> cb.getCategory().getCategoryId().equals(category.getCategoryId()))
                .map(CategoryBudgetEntity::getBudget)
                .findFirst()
                .orElse(BigDecimal.ZERO);

            DashboardCategorySummaryItem item = DashboardCategorySummaryItem.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getName())
                .totalSpendingMonth(calculateTotalForCategory(expenses, category))
                .budget(budget)
                .build();
            summaryItems.add(item);
        });

        return summaryItems;
    }

    private BigDecimal calculateTotalForCategory(List<ExpenseEntity> expenses, Category category) {
        return expenses.stream()
            .flatMap(expense -> expense.getItems().stream())
            .filter(item -> item.getCategory().getCategoryId().equals(category.getCategoryId()))
            .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<DashboardTrendItem> generateDashboardTrendItems(List<ExpenseEntity> thisMonthExpenses, Integer year, Integer month) {
        List<DashboardTrendItem> trendItems = new ArrayList<>();
        trendItems.add(buildDashboardTrendItem(thisMonthExpenses, year, month));

        YearMonth start = YearMonth.of(year, month);
        Stream.iterate(start.minusMonths(1), date -> date.minusMonths(1))
            .limit(5)
            .forEach(ym -> {
                List<ExpenseEntity> monthlyExpenses = expenseService.getExpensesForMonth(ym.getYear(), ym.getMonthValue());
                trendItems.add(buildDashboardTrendItem(monthlyExpenses, year, month));
        });

        return trendItems;
    }

    private DashboardTrendItem buildDashboardTrendItem(List<ExpenseEntity> expenses, Integer year, Integer month) {
        return DashboardTrendItem.builder()
            .year(year)
            .month(month)
            .totalAmount(expenses.stream().map(ExpenseEntity::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
            .build();
    }

    private DashboardKpi generateDashboardKpi(List<ExpenseEntity> expenses, Integer year, Integer month, String userEmail) {
        BigDecimal budget = budgetRepository.findByYearAndMonthAndUserEmail(year, month, userEmail)
                .map(MonthlyBudgetEntity::getBudget)
                .orElse(BigDecimal.ZERO);

        return DashboardKpi.builder()
            .budget(budget)
            .totalSpendingMonth(expenses.stream().map(ExpenseEntity::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
            .build();
    }
}
