package com.sp.smartreceipt.budget.controller;

import com.sp.smartreceipt.budget.service.BudgetService;
import com.sp.smartreceipt.model.MonthlyBudget;
import com.sp.smartreceipt.model.NewMonthlyBudget;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
public class BudgetController {
    private final BudgetService budgetService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public MonthlyBudget getBudget(@RequestParam Integer year, @RequestParam Integer month) {
        return budgetService.getMonthlyBudget(year, month);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MonthlyBudget createNewBudget(@RequestBody NewMonthlyBudget newMonthlyBudget) {
        return budgetService.createNewBudget(newMonthlyBudget);
    }

    @PutMapping("/{budgetId}")
    @ResponseStatus(HttpStatus.OK)
    public MonthlyBudget updateMonthlyBudget(@PathVariable("budgetId") UUID budgetId, @RequestBody NewMonthlyBudget newMonthlyBudget) {
        return budgetService.updateMonthlyBudget(budgetId, newMonthlyBudget);
    }
}
