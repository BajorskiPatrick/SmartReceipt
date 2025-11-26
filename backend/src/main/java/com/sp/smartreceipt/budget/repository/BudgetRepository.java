package com.sp.smartreceipt.budget.repository;

import com.sp.smartreceipt.budget.entity.MonthlyBudgetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BudgetRepository extends JpaRepository<MonthlyBudgetEntity, Long> {

    Optional<MonthlyBudgetEntity> findByYearAndMonthAndUserEmail(Integer year, Integer month, String userEmail);

    Optional<MonthlyBudgetEntity> findByMonthlyBudgetIdAndUserEmail(UUID monthlyBudgetId, String userEmail);
}
