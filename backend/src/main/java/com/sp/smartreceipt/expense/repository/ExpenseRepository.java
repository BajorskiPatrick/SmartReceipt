package com.sp.smartreceipt.expense.repository;

import com.sp.smartreceipt.expense.entity.ExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<ExpenseEntity, Long>, JpaSpecificationExecutor<ExpenseEntity> {

    Optional<ExpenseEntity> findByExpenseId(UUID id);

    @Query("SELECT e FROM ExpenseEntity e LEFT JOIN FETCH e.items WHERE e.expenseId = :expenseId")
    Optional<ExpenseEntity> findByExpenseIdWithItems(@Param("expenseId") UUID expenseId);

    @Query("SELECT e FROM ExpenseEntity e LEFT JOIN FETCH e.items i WHERE e.expenseId = :expenseId AND i.category.categoryId = :categoryId")
    Optional<ExpenseEntity> findByExpenseIdWithItemsByCategoryId(@Param("expenseId") UUID expenseId, @Param("categoryId") UUID categoryId);

    List<ExpenseEntity> findAllByUserEmailAndTransactionDateBetween(String email, OffsetDateTime start, OffsetDateTime end);
}
