package com.sp.smartreceipt.category.repository;

import com.sp.smartreceipt.category.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

    Optional<CategoryEntity> findByCategoryIdAndUserEmail(UUID categoryId, String userEmail);

    Optional<CategoryEntity> findByNameAndUserEmail(String categoryName, String userEmail);

    List<CategoryEntity> findAllByUserEmailAndDeletedFalse(String userEmail);
}
