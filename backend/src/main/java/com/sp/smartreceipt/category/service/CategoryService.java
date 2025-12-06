package com.sp.smartreceipt.category.service;

import com.sp.smartreceipt.category.config.PredefinedCategories;
import com.sp.smartreceipt.category.entity.CategoryEntity;
import com.sp.smartreceipt.category.repository.CategoryRepository;
import com.sp.smartreceipt.error.exception.CategoryAlreadyExistsException;
import com.sp.smartreceipt.error.exception.CategoryNotFoundException;
import com.sp.smartreceipt.error.exception.UserNotFoundException;
import com.sp.smartreceipt.model.Category;
import com.sp.smartreceipt.model.NewCategory;
import com.sp.smartreceipt.user.entity.UserEntity;
import com.sp.smartreceipt.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Category> fetchAllActiveCategories() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        log.info("Fetching all active categories for user: {}", userEmail);

        return categoryRepository.findAllByUserEmailAndDeletedFalse(userEmail)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public Category createCategory(NewCategory newCategory) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        log.info("Creating new category: {} for user: {}", newCategory.getName(), userEmail);

        CategoryEntity category = mapToEntity(newCategory);

        UserEntity currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException(userEmail));
        category.setUser(currentUser);

        try {
            CategoryEntity createdCategory = categoryRepository.save(category);
            return mapToDto(createdCategory);
        } catch (DataIntegrityViolationException e) {
            throw new CategoryAlreadyExistsException(newCategory.getName(), userEmail);
        }
    }

    @Transactional
    public Category updateCategory(UUID categoryId, NewCategory newCategory) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        log.info("Updating category with ID: {} for user: {}", categoryId, userEmail);

        CategoryEntity category = categoryRepository.findByCategoryIdAndUserEmail(categoryId, userEmail)
                .orElseThrow(() -> new CategoryNotFoundException(categoryId.toString(), userEmail));

        category.setName(newCategory.getName());
        category.setDescription(newCategory.getDescription());

        CategoryEntity updatedCategory = categoryRepository.save(category);

        return mapToDto(updatedCategory);
    }

    @Transactional
    public void markCategoryAsDeleted(UUID categoryId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        log.info("Marking category with ID: {} as deleted for user: {}", categoryId, userEmail);

        CategoryEntity category = categoryRepository.findByCategoryIdAndUserEmail(categoryId, userEmail)
                .orElseThrow(() -> new CategoryNotFoundException(categoryId.toString(), userEmail));

        category.setDeleted(true);
        categoryRepository.save(category);
    }

    @Transactional
    public void addPredefinedCategoriesToUser(UserEntity user) {
        Arrays.stream(PredefinedCategories.values()).forEach(predefinedCategory -> {
            CategoryEntity category = CategoryEntity.builder()
                    .categoryId(UUID.randomUUID())
                    .name(predefinedCategory.getDisplayName())
                    .description("")
                    .deleted(false)
                    .user(user)
                    .build();

            categoryRepository.save(category);
        });
    }

    private CategoryEntity mapToEntity(NewCategory newCategory) {
        return CategoryEntity.builder()
                .categoryId(UUID.randomUUID())
                .name(newCategory.getName())
                .description(newCategory.getDescription())
                .deleted(false)
                .build();
    }

    private Category mapToDto(CategoryEntity category) {
        return Category.builder()
                .categoryId(category.getCategoryId())
                .description(category.getDescription())
                .name(category.getName())
                .build();
    }
}
