package com.sp.smartreceipt.expense.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ExpenseFilterRequest {
    @NotNull
    private Integer year;

    @NotNull
    @Min(1)
    @Max(12)
    private Integer month;

    private UUID categoryId;

    @Min(0)
    private Integer page = 0;

    @Min(0)
    @Max(100)
    private Integer size = 20;
}
