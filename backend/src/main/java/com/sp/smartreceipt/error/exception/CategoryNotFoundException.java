package com.sp.smartreceipt.error.exception;

public class CategoryNotFoundException extends ResourceNotFoundException {
    public CategoryNotFoundException(String id, String email) {
        super("Category with ID: " + id + " does not exist for user with email: " + email);
    }
}
