package com.worksphere.exception;

import com.worksphere.auth.AuthController.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler =
            new GlobalExceptionHandler();

    @Test
    void currentTenantAccessDeniedShouldReturnForbiddenInsteadOfServerError() {
        ResponseEntity<ErrorResponse> response =
                handler.handleAccessDenied(
                        new AccessDeniedException(
                                "Authenticated organization context is required"));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("FORBIDDEN", response.getBody().code());
        assertEquals(
                "You do not have permission to perform this action",
                response.getBody().message());
    }
}
