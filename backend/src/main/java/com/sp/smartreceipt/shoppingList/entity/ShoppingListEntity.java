package com.sp.smartreceipt.shoppingList.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import com.sp.smartreceipt.user.entity.UserEntity;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "shopping_lists")
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShoppingListEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private UUID shoppingListId;

    @Column(unique = true)
    private String name;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private OffsetDateTime createdAt;

    private Integer itemCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;
}
