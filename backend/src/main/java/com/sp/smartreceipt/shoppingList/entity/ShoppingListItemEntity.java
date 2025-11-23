package com.sp.smartreceipt.shoppingList.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "shopping_list_items", uniqueConstraints = {
                @UniqueConstraint(columnNames = { "shopping_list_id", "product_name" })
})
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShoppingListItemEntity {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(unique = true)
        private UUID shoppingListItemId;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "shopping_list_id")
        private ShoppingListEntity shoppingList;

        private String productName;

        private BigDecimal quantity;

        private String unit;

        private Boolean isPurchased;
}
