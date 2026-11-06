
package com.worksphere.exception;

import com.worksphere.auth.AuthController.ErrorResponse;

import org.junit.jupiter.api.Test;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new TestController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    private final GlobalExceptionHandler handler =
            new GlobalExceptionHandler();

    // ==========================================
    // AUTHORIZATION EXCEPTION TESTS
    // ==========================================

    @Test
    void authorizationDeniedShouldReturnForbidden() {

        ErrorResponse response = handler.handleAuthorizationDenied(
                new AuthorizationDeniedException(
                        "Authorization denied"
                )
        ).getBody();

        assertNotNull(response);
        assertEquals("FORBIDDEN", response.code());

        assertEquals(
                "You do not have permission to perform this action",
                response.message()
        );
    }

    @Test
    void accessDeniedShouldReturnForbidden() {

        ErrorResponse response = handler.handleAccessDenied(
                new AccessDeniedException(
                        "Authenticated organization context is required"
                )
        ).getBody();

        assertNotNull(response);
        assertEquals("FORBIDDEN", response.code());

        assertEquals(
                "You do not have permission to perform this action",
                response.message()
        );
    }

    // ==========================================
    // REQUEST VALIDATION TESTS
    // ==========================================

    @Test
    void malformedJsonReturnsBadRequest() throws Exception {

        mockMvc.perform(post("/test/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{invalid-json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code")
                        .value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.message")
                        .value(
                                "The request body is invalid or contains an unsupported value"
                        ));
    }

    // ==========================================
    // DATABASE CONFLICT TESTS
    // ==========================================

    @Test
    void dataIntegrityViolationShouldReturnConflict() {

        var response = handler.handleDataIntegrityViolation(
                new DataIntegrityViolationException(
                        "Internal database constraint details"
                )
        );

        assertEquals(
                HttpStatus.CONFLICT,
                response.getStatusCode()
        );

        ErrorResponse body = response.getBody();

        assertNotNull(body);
        assertEquals("CONFLICT", body.code());

        assertEquals(
                "The request conflicts with existing data",
                body.message()
        );
    }

    // ==========================================
    // DUPLICATE EMAIL TEST
    // ==========================================

    @Test
    void duplicateEmailShouldReturnSpecificConflictResponse() {

        ResponseStatusException exception =
                new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Email is already registered"
                );

        var response = handler.handleResponseStatus(exception);

        assertEquals(
                HttpStatus.CONFLICT,
                response.getStatusCode()
        );

        ErrorResponse body = response.getBody();

        assertNotNull(body);

        assertEquals(
                "EMAIL_ALREADY_REGISTERED",
                body.code()
        );

        assertEquals(
                "This email address already has a WorkSphere account. Please sign in or use another email.",
                body.message()
        );
    }

    // ==========================================
    // OTHER HTTP 409 CONFLICT TEST
    // ==========================================

    @Test
    void otherResponseStatusConflictShouldReturnGenericConflict() {

        ResponseStatusException exception =
                new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Another database constraint was violated"
                );

        var response = handler.handleResponseStatus(exception);

        assertEquals(
                HttpStatus.CONFLICT,
                response.getStatusCode()
        );

        ErrorResponse body = response.getBody();

        assertNotNull(body);

        assertEquals(
                "CONFLICT",
                body.code()
        );

        assertEquals(
                "The request conflicts with existing data",
                body.message()
        );
    }

    // ==========================================
    // TEST CONTROLLER
    // ==========================================

    @org.springframework.web.bind.annotation.RestController
    static class TestController {

        @org.springframework.web.bind.annotation.PostMapping(
                "/test/request"
        )
        public TestRequest create(
                @org.springframework.web.bind.annotation.RequestBody
                TestRequest request
        ) {
            return request;
        }
    }

    static class TestRequest {

        public String name;
    }
}
