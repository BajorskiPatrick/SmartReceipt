package com.sp.smartreceipt.expense.repository;

import com.sp.smartreceipt.expense.entity.ExpenseEntity;
import org.springframework.data.jpa.repository.EntityGraph;
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

    @EntityGraph(attributePaths = {"items"})
    @Query("SELECT e FROM ExpenseEntity e WHERE e.expenseId = :id AND e.user.email = :userEmail")
    Optional<ExpenseEntity> findByExpenseIdAndUserEmailAndFetchItems(@Param("id") UUID id, @Param("userEmail") String userEmail);

    List<ExpenseEntity> findAllByUserEmailAndTransactionDateBetween(String email, OffsetDateTime start, OffsetDateTime end);

    @EntityGraph(attributePaths = {"items"})
    @Query("SELECT e FROM ExpenseEntity e WHERE e.user.email = :email AND e.transactionDate BETWEEN :start AND :end")
    List<ExpenseEntity> findAllByUserEmailAndTransactionDateBetweenAndFetchItems(
            @Param("email") String email,
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end
    );
}
