package com.sp.smartreceipt.expense.service;

import com.sp.smartreceipt.error.exception.OcrProcessingException;
import com.sp.smartreceipt.error.exception.OcrTimeoutException;
import com.sp.smartreceipt.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.SocketTimeoutException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiOcrService {

    private final RestClient restClient;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Transactional
    public OcrExpense processReceiptUpload(MultipartFile file, NewOcrExpense ocrExpense) {
        log.info("Processing receipt upload: {}", file.getOriginalFilename());
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
            return mapToExpenseDetails(aiResponse, ocrExpense);

        } catch (SocketTimeoutException e) {
            log.error("OCR service timeout", e);
            throw new OcrTimeoutException(e.getMessage());
        } catch (IOException e) {
            log.error("File processing error during OCR", e);
            throw new OcrProcessingException("File processing error");
        }
    }

    private OcrExpense mapToExpenseDetails(OcrResult aiResponse, NewOcrExpense ocrExpense) {
        return OcrExpense.builder()
                .description(ocrExpense.getDescription())
                .transactionDate(ocrExpense.getTransactionDate())
                .totalAmount(calculateTotal(aiResponse))
                .itemCount(aiResponse.getExpenses().size())
                .items(aiResponse.getExpenses())
                .build();
    }

    private BigDecimal calculateTotal(OcrResult aiResponse) {
        return aiResponse.getExpenses().stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
