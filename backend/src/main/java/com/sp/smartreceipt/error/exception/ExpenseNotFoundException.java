package com.sp.smartreceipt.error.exception;

public class ExpenseNotFoundException extends ResourceNotFoundException {
    public ExpenseNotFoundException(String id, String email) {
        super("Expense with ID: " + id + " does not exist for user with email: " + email);
    }
}
