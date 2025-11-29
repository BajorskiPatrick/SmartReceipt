package com.sp.smartreceipt.budget.entity;

import com.sp.smartreceipt.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "monthly_budgets", uniqueConstraints = {
        @UniqueConstraint(
                name = "unique_monthly_budget_year_month",
                columnNames = {"user_id", "year", "month"}
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
    private UUID monthlyBudgetId;

    @Column(nullable = false, updatable = false)
    private Integer year;

    @Column(nullable = false, updatable = false)
    private Integer month;

    @Column(nullable = false)
    private java.math.BigDecimal budget;

    @OneToMany(
            mappedBy = "monthlyBudget",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.EAGER
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<MonthlyCategoryBudgetEntity> categoryBudgets = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    public void addCategoryBudget(MonthlyCategoryBudgetEntity categoryBudget) {
        categoryBudgets.add(categoryBudget);
        categoryBudget.setMonthlyBudget(this);
    }
}
