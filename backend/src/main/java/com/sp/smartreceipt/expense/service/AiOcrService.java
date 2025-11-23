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

@Service
@RequiredArgsConstructor
public class AiOcrService {

    private final RestClient restClient;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Transactional
    public OcrExpense processReceiptUpload(MultipartFile file, NewOcrExpense ocrExpense) {
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
                    .uri(aiServiceUrl + "/analyze")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(OcrResult.class);

            if (aiResponse == null) {
                throw new OcrProcessingException("No response received from OCR module");
            }

            return mapToExpenseDetails(aiResponse, ocrExpense);

        }  catch (SocketTimeoutException e) {
            throw new OcrTimeoutException(e.getMessage());
        } catch (IOException e) {
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
