package com.sp.smartreceipt.category.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

import com.sp.smartreceipt.user.entity.UserEntity;

@Entity
@Table(name = "categories", uniqueConstraints = {
        @UniqueConstraint(
                name = "unique_name_for_user",
                columnNames = {"category_id", "user_id"}
        )
})
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private UUID categoryId;

    private String name;

    private String description;

    @Builder.Default
    private boolean deleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;
}
