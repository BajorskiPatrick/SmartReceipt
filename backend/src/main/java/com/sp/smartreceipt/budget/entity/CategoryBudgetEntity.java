package com.sp.smartreceipt.budget.entity;

import com.sp.smartreceipt.category.entity.CategoryEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "category_budgets")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBudgetEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID categoryBudgetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoryEntity category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "monthly_budget_id")
    private MonthlyBudgetEntity monthlyBudget;

    @Column(nullable = false)
    private java.math.BigDecimal budget;
}
