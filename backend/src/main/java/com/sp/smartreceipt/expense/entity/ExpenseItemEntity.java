package com.sp.smartreceipt.expense.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

import com.sp.smartreceipt.category.entity.CategoryEntity;

@Entity
@Table(name = "expense_items")
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private UUID expenseItemId;

    private String productName;

    private Integer quantity;

    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id")
    @ToString.Exclude                // Unikamy pętli
    @EqualsAndHashCode.Exclude
    private ExpenseEntity expense;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoryEntity category;
}
