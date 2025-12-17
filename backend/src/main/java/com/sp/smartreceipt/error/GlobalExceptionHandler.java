package com.sp.smartreceipt.error;

import com.sp.smartreceipt.error.exception.*;
import com.sp.smartreceipt.model.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // LEVEL 1 - business exceptions
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        return createResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(BudgetYearAndMonthMismatch.class)
    public ResponseEntity<ErrorResponse> handleNotFound(BudgetYearAndMonthMismatch ex, HttpServletRequest request) {
        log.warn("Unsupported operation: {}", ex.getMessage());
        return createResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // LEVEL 2 - framework / validation exceptions
    @ExceptionHandler(DataValidationException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(DataValidationException ex, HttpServletRequest request) {
        log.warn("Bad Request: {}", ex.getMessage());
        return createResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        List<String> details = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();
        log.warn("Validation failed: {}", details);

        return createResponse(HttpStatus.BAD_REQUEST, "Request data validation error", details, request);
    }

    @ExceptionHandler(TokenRefreshException.class)
    public ResponseEntity<ErrorResponse> handleTokenRefreshException(TokenRefreshException ex,
            HttpServletRequest request) {
        log.warn("Token refresh failed: {}", ex.getMessage());
        return createResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(FileUploadException.class)
    public ResponseEntity<ErrorResponse> handleFileUploadException(FileUploadException ex, HttpServletRequest request) {
        log.error("File upload error: {}", ex.getMessage());
        return createResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxSizeException(MaxUploadSizeExceededException ex,
            HttpServletRequest request) {
        log.warn("Max upload size exceeded: {}", ex.getMessage());
        return createResponse(HttpStatus.EXPECTATION_FAILED, "File is to large. Maximum size is 10MB", request);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        log.warn("Bad credentials for request: {}", request.getRequestURI());
        return createResponse(HttpStatus.UNAUTHORIZED, "Email or Password is incorrect", request);
    }

    @ExceptionHandler(OcrProcessingException.class)
    public ResponseEntity<ErrorResponse> handleOcrProcessingException(OcrProcessingException ex,
            HttpServletRequest request) {
        log.error("OCR processing failed: {}", ex.getMessage());
        return createResponse(HttpStatus.BAD_GATEWAY, ex.getMessage(), request);
    }

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleDatabaseIntegrityViolationException(ResourceAlreadyExistsException ex,
            HttpServletRequest request) {
        log.error("Resource with provided data already exists: {}", ex.getMessage());
        return createResponse(HttpStatus.CONFLICT, "Resource with provided data already exists: " + ex.getMessage(), request);
    }


    // LEVEL 3 - everything else (response code 500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();

        log.error("Nieoczekiwany błąd ID: {} ", errorId, ex);

        return createResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal server error. Contact with support and provide error ID:  " + errorId,
                request);
    }

    private ResponseEntity<ErrorResponse> createResponse(HttpStatus status, String message, HttpServletRequest request) {
        return createResponse(status, message, List.of(), request);
    }

    private ResponseEntity<ErrorResponse> createResponse(HttpStatus status, String message, List<String> details, HttpServletRequest request) {
        ErrorResponse body = ErrorResponse.builder()
                .errorId(UUID.randomUUID())
                .timestamp(OffsetDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .details(details)
                .build();

        return new ResponseEntity<>(body, status);
    }
}
