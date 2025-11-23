package com.sp.smartreceipt.error.exception;

public class ExpenseItemNotFoundException extends ResourceNotFoundException {
    public ExpenseItemNotFoundException(String expenseItemId, String userEmail) {
        super("Expense item with ID: " + expenseItemId + " does not exist for user with email: " + userEmail);
    }
}
