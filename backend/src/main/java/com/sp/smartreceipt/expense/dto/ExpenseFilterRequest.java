package com.sp.smartreceipt.expense.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExpenseFilterRequest {
    @Valid
    @NotNull
    private Integer year;

    @Valid
    @NotNull
    private Integer month;

    private Integer page = 0;

    private Integer size = 20;
}
