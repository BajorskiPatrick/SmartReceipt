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

    Optional<ExpenseEntity> findByExpenseIdAndUserEmail(UUID id, String userEmail);

    @Query("SELECT e FROM ExpenseEntity e LEFT JOIN FETCH e.items WHERE e.expenseId = :expenseId AND e.user.email = :userEmail")
    Optional<ExpenseEntity> findByExpenseIdAndUserEmailWithItems(@Param("expenseId") UUID expenseId, @Param("userEmail") String userEmail);

    List<ExpenseEntity> findAllByUserEmailAndTransactionDateBetween(String email, OffsetDateTime start, OffsetDateTime end);
}
