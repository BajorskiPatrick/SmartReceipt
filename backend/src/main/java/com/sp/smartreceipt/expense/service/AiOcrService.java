package com.sp.smartreceipt.expense.service;

import com.sp.smartreceipt.category.entity.CategoryEntity;
import com.sp.smartreceipt.category.repository.CategoryRepository;
import com.sp.smartreceipt.category.service.CategoryService;
import com.sp.smartreceipt.error.exception.OcrProcessingException;
import com.sp.smartreceipt.error.exception.OcrTimeoutException;
import com.sp.smartreceipt.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.SocketTimeoutException;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiOcrService {

    private final RestClient restClient;

    private final CategoryRepository categoryRepository;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Transactional
    public OcrExpense processReceiptUpload(MultipartFile file, NewOcrExpense ocrExpense) {
        log.info("Processing receipt upload: {}", file.getOriginalFilename());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            Resource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            body.add("image", fileResource);

            OcrResult aiResponse = restClient.post()
                    .uri(aiServiceUrl + "/ai/ocr/process")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(OcrResult.class);

            if (aiResponse == null) {
                log.error("No response received from OCR module");
                throw new OcrProcessingException("No response received from OCR module");
            }

            log.info("OCR processing completed successfully");
            return mapToOcrExpense(aiResponse, ocrExpense, userEmail);

        } catch (SocketTimeoutException e) {
            log.error("OCR service timeout", e);
            throw new OcrTimeoutException(e.getMessage());
        } catch (IOException e) {
            log.error("File processing error during OCR", e);
            throw new OcrProcessingException("File processing error");
        }
    }

    private OcrExpense mapToOcrExpense(OcrResult aiResponse, NewOcrExpense ocrExpense, String userEmail) {
        return OcrExpense.builder()
                .description(ocrExpense.getDescription())
                .transactionDate(ocrExpense.getTransactionDate())
                .totalAmount(calculateTotal(aiResponse))
                .itemCount(aiResponse.getExpenses().size())
                .items(aiResponse.getExpenses().stream()
                        .map(i -> mapToOcrExpenseItem(i, userEmail))
                        .toList()
                )
                .build();
    }

    private OcrExpenseItem mapToOcrExpenseItem(OcrResultExpenseItem resultExpenseItem, String userEmail) {
        UUID categoryId = categoryRepository.findByNameAndUserEmail(resultExpenseItem.getCategoryName(), userEmail)
                .map(CategoryEntity::getCategoryId)
                .orElseThrow(() -> new OcrProcessingException("Category with name " + resultExpenseItem.getCategoryName() + "doesn't exist for user with email " + userEmail + "!"));

        return OcrExpenseItem.builder()
                .price(resultExpenseItem.getPrice())
                .productName(resultExpenseItem.getProductName())
                .quantity(resultExpenseItem.getQuantity())
                .categoryId(categoryId)
                .build();
    }

    private BigDecimal calculateTotal(OcrResult aiResponse) {
        return aiResponse.getExpenses().stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
