package com.sp.smartreceipt.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sp.smartreceipt.model.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {

        if (response.isCommitted()) {
            return;
        }

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        String message = (accessDeniedException != null && accessDeniedException.getMessage() != null
                && !accessDeniedException.getMessage().isBlank())
                ? accessDeniedException.getMessage()
                : "Forbidden";

        ErrorResponse body = ErrorResponse.builder()
                .errorId(UUID.randomUUID())
                .timestamp(OffsetDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error(HttpStatus.FORBIDDEN.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .details(List.of())
                .build();

        objectMapper.writeValue(response.getWriter(), body);
    }
}
