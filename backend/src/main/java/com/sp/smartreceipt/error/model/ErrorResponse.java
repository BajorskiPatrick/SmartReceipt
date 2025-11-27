package com.sp.smartreceipt.error.model;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    @NotNull
    private String id;

    @NotNull
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime timestamp;

    @NotNull
    private int status;

    @NotNull
    private String error;

    @NotNull
    private String message;

    @NotNull
    private String path;

    @NotNull
    private List<String> details;
}
