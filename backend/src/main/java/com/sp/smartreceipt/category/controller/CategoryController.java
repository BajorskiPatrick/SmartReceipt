package com.sp.smartreceipt.category.controller;

import com.sp.smartreceipt.category.service.CategoryService;
import com.sp.smartreceipt.model.Category;
import com.sp.smartreceipt.model.NewCategory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<Category> getAllCategories() {
        return categoryService.fetchAllCategories();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Category addCategory(@RequestBody @Valid NewCategory newCategory) {
        return categoryService.createCategory(newCategory);
    }

    @PutMapping("/{categoryId}")
    @ResponseStatus(HttpStatus.OK)
    public Category updateCategory(@PathVariable UUID categoryId, @RequestBody @Valid NewCategory newCategory) {
        return categoryService.updateCategory(categoryId, newCategory);
    }

    @DeleteMapping("/{categoryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable UUID categoryId) {
        categoryService.markCategoryAsDeleted(categoryId);
    }
}
