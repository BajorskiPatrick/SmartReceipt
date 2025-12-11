package com.sp.smartreceipt.error.exception;

public class BudgetAlreadyDefinedException extends ResourceAlreadyExistsException {
    public BudgetAlreadyDefinedException(String year, String month, String userEmail) {
        super("Budget for " + year + "-" + month + " already defined for user: " + userEmail);
    }
}
