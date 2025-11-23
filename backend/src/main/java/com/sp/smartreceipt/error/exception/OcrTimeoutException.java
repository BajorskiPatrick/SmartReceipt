package com.sp.smartreceipt.error.exception;

public class OcrTimeoutException extends RuntimeException {
    public OcrTimeoutException(String message) {
        super(message);
    }
}
