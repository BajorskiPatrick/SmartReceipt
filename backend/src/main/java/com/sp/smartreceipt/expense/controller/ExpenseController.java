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

import lombok.extern.slf4j.Slf4j;

@Slf4j
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
        log.info("Fetching expense summary with filters: {}", parameters);
        return expenseService.searchExpenses(parameters);
    }

    @GetMapping("/{expenseId}")
    @ResponseStatus(HttpStatus.OK)
    public ExpenseDetails getExpenseDetails(@PathVariable UUID expenseId, @RequestParam(required = false) UUID categoryId) {
        log.info("Fetching details for expense ID: {}", expenseId);
        return expenseService.searchExpenseDetails(expenseId, categoryId);
    }

    @PutMapping("/{expenseId}")
    @ResponseStatus(HttpStatus.OK)
    public ExpenseDetails updateExpense(@PathVariable UUID expenseId, @RequestBody @Valid NewExpense newExpense) {
        log.info("Updating expense ID: {}", expenseId);
        return expenseService.updateExpense(expenseId, newExpense);
    }

    @DeleteMapping("/{expenseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExpense(@PathVariable UUID expenseId) {
        log.info("Deleting expense ID: {}", expenseId);
        expenseService.deleteExpense(expenseId);
    }

    @DeleteMapping("/{expenseId}/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExpense(@PathVariable UUID expenseId, @PathVariable UUID itemId) {
        log.info("Deleting item ID: {} from expense ID: {}", itemId, expenseId);
        expenseItemService.deleteItem(expenseId, itemId);
    }

    @PutMapping("/{expenseId}/items/{itemId}")
    @ResponseStatus(HttpStatus.OK)
    public ExpenseItem updateExpenseItem(
            @PathVariable UUID expenseId,
            @PathVariable UUID itemId,
            @RequestBody @Valid NewExpenseItem itemRequest) {
        log.info("Updating item ID: {} in expense ID: {}", itemId, expenseId);

        return expenseItemService.updateExpenseItem(expenseId, itemId, itemRequest);
    }

    @PostMapping("/manual")
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseDetails addExpense(@RequestBody NewExpense newExpense) {
        log.info("Adding new manual expense");
        return expenseService.addNewExpense(newExpense);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    public OcrExpense uploadReceipt(@RequestPart("file") MultipartFile file,
            @RequestPart("data") NewOcrExpense ocrExpense) {
        log.info("Uploading receipt file: {}", file.getOriginalFilename());
        if (file.isEmpty()) {
            throw new EmptyFileException();
        }

        return ocrService.processReceiptUpload(file, ocrExpense);
    }
}
