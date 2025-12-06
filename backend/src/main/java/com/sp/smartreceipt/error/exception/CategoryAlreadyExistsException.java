package com.sp.smartreceipt.error.exception;

public class CategoryAlreadyExistsException extends ResourceAlreadyExistsException {
    public CategoryAlreadyExistsException(String categoryName, String userEmail) {
        super("Category with name '" + categoryName + "' already exists for user with email '" + userEmail + "'.");
    }
}
