package com.sp.smartreceipt.error.exception;

public class BudgetYearAndMonthMismatch extends RuntimeException {
    public BudgetYearAndMonthMismatch() {
        super("Year and month of a budget can not be changed");
    }
}
