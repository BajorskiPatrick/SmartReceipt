package com.sp.smartreceipt.error.exception;

public class BudgetNotFoundException extends ResourceNotFoundException {
    public BudgetNotFoundException(Integer year, Integer month, String userEmail) {
        super("Budget for " + year + "-" + month + " not found for user with email: " + userEmail);
    }

    public BudgetNotFoundException(String id, String userEmail) {
        super("Budget with ID: " + id +  " not found for user with email: " + userEmail);
    }
}
