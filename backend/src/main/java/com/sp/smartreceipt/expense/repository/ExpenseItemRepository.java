package com.sp.smartreceipt.expense.repository;

import com.sp.smartreceipt.expense.entity.ExpenseItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ExpenseItemRepository extends JpaRepository<ExpenseItemEntity, UUID> {
    Optional<ExpenseItemEntity> findByExpenseItemId(UUID expenseItemId);
}
