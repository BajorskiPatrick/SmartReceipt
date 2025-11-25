package com.sp.smartreceipt.dashboard.service;

import com.sp.smartreceipt.budget.entity.MonthlyBudgetEntity;
import com.sp.smartreceipt.budget.repository.BudgetRepository;
import com.sp.smartreceipt.expense.entity.ExpenseEntity;
import com.sp.smartreceipt.expense.service.ExpenseService;
import com.sp.smartreceipt.model.DashboardData;
import com.sp.smartreceipt.model.DashboardKpi;
import com.sp.smartreceipt.model.DashboardTrendItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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

    private final BudgetRepository budgetRepository;

    public DashboardData getDashboardData(Integer year, Integer month) {
        List<ExpenseEntity> thisMonthExpenses = expenseService.getExpensesForMonth(year, month);

        List<DashboardTrendItem> previousTrendItems = generateDashboardTrendItems(thisMonthExpenses, year, month);
        DashboardKpi  dashboardKpi = generateDashboardKpi(thisMonthExpenses, year, month);

        return DashboardData.builder()
                .kpi(dashboardKpi)
                .trendSummary(previousTrendItems)
                .build();
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

    private DashboardKpi generateDashboardKpi(List<ExpenseEntity> expenses, Integer year, Integer month) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        BigDecimal budget = budgetRepository.findByYearAndMonthAndUserEmail(year, month, userEmail)
                .map(MonthlyBudgetEntity::getBudget)
                .orElse(BigDecimal.ZERO);

        return DashboardKpi.builder()
                .budget(budget)
                .totalSpendingMonth(expenses.stream().map(ExpenseEntity::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
                .build();
    }
}
