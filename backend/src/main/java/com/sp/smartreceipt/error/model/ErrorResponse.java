package com.sp.smartreceipt.error.model;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponse(
        String id,
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        List<String> details
) {
}
