package com.sp.smartreceipt.budget.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "monthly_budgets", uniqueConstraints = {
        @UniqueConstraint(
                name = "unique_monthly_budget_year_month",
                columnNames = {"year", "month"}
        )
})
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyBudgetEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID budgetId;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private java.math.BigDecimal budget;

    @OneToMany(
            mappedBy = "expense",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<CategoryBudgetEntity> categoryBudgets = new ArrayList<>();
}
