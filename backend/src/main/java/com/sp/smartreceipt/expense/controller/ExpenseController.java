package com.sp.smartreceipt.expense.controller;

import com.sp.smartreceipt.error.exception.EmptyFileException;
import com.sp.smartreceipt.expense.dto.ExpenseFilterRequest;
import com.sp.smartreceipt.expense.service.AiOcrService;
import com.sp.smartreceipt.expense.service.ExpenseItemService;
import com.sp.smartreceipt.expense.service.ExpenseService;
import com.sp.smartreceipt.model.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    private final ExpenseItemService expenseItemService;

    private final AiOcrService ocrService;

    @GetMapping()
    @ResponseStatus(HttpStatus.OK)
    public ExpenseSummaryPage getExpenseSummary(@ModelAttribute ExpenseFilterRequest parameters) {
        return expenseService.searchExpenses(parameters);
    }

    @GetMapping("/{expenseId}")
    @ResponseStatus(HttpStatus.OK)
    public ExpenseDetails getExpenseDetails(@PathVariable UUID expenseId) {
        return expenseService.searchExpenseDetails(expenseId);
    }

    @PutMapping("/{expenseId}")
    @ResponseStatus(HttpStatus.OK)
    public ExpenseDetails updateExpense(@PathVariable UUID expenseId, @RequestBody @Valid NewExpense newExpense) {
        return expenseService.updateExpense(expenseId, newExpense);
    }

    @DeleteMapping("/{expenseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExpense(@PathVariable UUID expenseId) {
        expenseService.deleteExpense(expenseId);
    }

    @DeleteMapping("/{expenseId}/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExpense(@PathVariable UUID expenseId, @PathVariable UUID itemId) {
        expenseItemService.deleteItem(expenseId, itemId);
    }

    @PutMapping("/{expenseId}/items/{itemId}")
    public ExpenseItem updateExpenseItem(
            @PathVariable UUID expenseId,
            @PathVariable UUID itemId,
            @RequestBody @Valid NewExpenseItem itemRequest) {

        return expenseItemService.updateExpenseItem(expenseId, itemId, itemRequest);
    }

    @PostMapping("/manual")
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseDetails addExpense(@RequestBody NewExpense newExpense) {
        return expenseService.addNewExpense(newExpense);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    public OcrExpense uploadReceipt(@RequestPart("file") MultipartFile file, @RequestPart("data") NewOcrExpense ocrExpense) {
        if (file.isEmpty()) {
            throw new EmptyFileException();
        }

        return ocrService.processReceiptUpload(file, ocrExpense);
    }
}
