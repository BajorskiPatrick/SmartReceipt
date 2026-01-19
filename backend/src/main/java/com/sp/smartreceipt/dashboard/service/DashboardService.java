package com.sp.smartreceipt.dashboard.service;

import com.sp.smartreceipt.budget.entity.MonthlyCategoryBudgetEntity;
import com.sp.smartreceipt.budget.entity.MonthlyBudgetEntity;
import com.sp.smartreceipt.budget.repository.BudgetRepository;
import com.sp.smartreceipt.category.entity.CategoryEntity;
import com.sp.smartreceipt.error.exception.DataValidationException;
import com.sp.smartreceipt.expense.entity.ExpenseEntity;
import com.sp.smartreceipt.expense.service.ExpenseService;
import com.sp.smartreceipt.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExpenseService expenseService;

    private final BudgetRepository budgetRepository;

    @Transactional
    public YearlySpendingSummary getYearlySpendingSummary(Integer year) {
        if (LocalDate.now().getYear() < year) {
            throw new DataValidationException("Requested year cannot be in the future");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        log.info("Fetching yearly spending summary for {} for user {}", year, userEmail);

        List<MonthlySpendingSummaryItem> monthlySummaries = new ArrayList<>();

        Stream.iterate(YearMonth.of(year, 1), date -> date.plusMonths(1))
            .limit(12)
            .forEach(ym -> {
                List<ExpenseEntity> monthlyExpenses = expenseService.getExpensesForMonth(ym.getYear(), ym.getMonthValue(), false);
                DashboardTrendItem trendItem = buildDashboardTrendItem(monthlyExpenses, ym.getYear(), ym.getMonthValue());
                BigDecimal monthlyBudget = budgetRepository.findByYearAndMonthAndUserEmail(ym.getYear(), ym.getMonthValue(), userEmail)
                    .map(MonthlyBudgetEntity::getBudget)
                    .orElse(BigDecimal.ZERO);

                MonthlySpendingSummaryItem summaryItem = MonthlySpendingSummaryItem.builder()
                    .month(ym.getMonthValue())
                    .totalSpending(trendItem.getTotalAmount())
                    .budget(monthlyBudget)
                    .build();
                monthlySummaries.add(summaryItem);
        });

        return YearlySpendingSummary.builder()
            .year(year)
            .monthlySummaries(monthlySummaries)
            .build();
    }

    @Transactional
    public DashboardData getDashboardData(Integer year, Integer month) {
        // Validation for future date removed to allow viewing budgets for next months


        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        log.info("Fetching dashboard data for {}-{} for user {}", year, month, userEmail);

        List<ExpenseEntity> thisMonthExpenses = expenseService.getExpensesForMonth(year, month, true);

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
        List<MonthlyCategoryBudgetEntity> categoryBudgets = budgetRepository.findByYearAndMonthAndUserEmail(year, month, userEmail)
                .map(MonthlyBudgetEntity::getCategoryBudgets)
                .orElse(new ArrayList<>());

        List<DashboardCategorySummaryItem> summaryItems = new ArrayList<>();
        Map<CategoryEntity, BigDecimal> categoryTotalSpendingMap = new HashMap<>();

        expenses.stream()
                .flatMap((expense) -> expense.getItems().stream())
                .forEach(item ->
                    categoryTotalSpendingMap.merge(item.getCategory(), item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())), BigDecimal::add)
                );

        categoryTotalSpendingMap.forEach((category, total) -> {
            BigDecimal budget = categoryBudgets.stream()
                    .filter(cb -> cb.getCategory().getCategoryId().equals(category.getCategoryId()))
                    .map(MonthlyCategoryBudgetEntity::getBudget)
                    .findFirst()
                    .orElse(BigDecimal.ZERO);

            DashboardCategorySummaryItem item = DashboardCategorySummaryItem.builder()
                    .categoryId(category.getCategoryId())
                    .categoryName(category.getName())
                    .totalSpendingMonth(total)
                    .budget(budget)
                    .build();
            summaryItems.add(item);
        });

        return summaryItems;
    }

    private List<DashboardTrendItem> generateDashboardTrendItems(List<ExpenseEntity> thisMonthExpenses, Integer year, Integer month) {
        List<DashboardTrendItem> trendItems = new ArrayList<>();
        trendItems.add(buildDashboardTrendItem(thisMonthExpenses, year, month));

        YearMonth start = YearMonth.of(year, month);
        Stream.iterate(start.minusMonths(1), date -> date.minusMonths(1))
            .limit(5)
            .forEach(ym -> {
                List<ExpenseEntity> monthlyExpenses = expenseService.getExpensesForMonth(ym.getYear(), ym.getMonthValue(), false);
                trendItems.add(buildDashboardTrendItem(monthlyExpenses, ym.getYear(), ym.getMonthValue()));
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
