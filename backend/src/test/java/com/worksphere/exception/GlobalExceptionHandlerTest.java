
package com.worksphere.exception;

import com.worksphere.auth.AuthController.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.security.authorization.AuthorizationDeniedException;

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

    @Test
    void currentTenantAccessDeniedShouldReturnForbiddenInsteadOfServerError() {
        ErrorResponse response = handler.handleAuthorizationDenied(
                new AuthorizationDeniedException(
                        "Authenticated organization context is required"
                )
        ).getBody();

        org.junit.jupiter.api.Assertions.assertNotNull(response);
        org.junit.jupiter.api.Assertions.assertEquals(
                "FORBIDDEN", response.code()
        );
        org.junit.jupiter.api.Assertions.assertEquals(
                "You do not have permission to perform this action",
                response.message()
        );
    }

    @Test
    void malformedJsonReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/test/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{invalid-json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.message").value(
                        "The request body is invalid or contains an unsupported value"
                ));
    }

    @org.springframework.web.bind.annotation.RestController
    static class TestController {

        @org.springframework.web.bind.annotation.PostMapping("/test/request")
        public TestRequest create(
                @org.springframework.web.bind.annotation.RequestBody
                TestRequest request) {
            return request;
        }
    }

    static class TestRequest {
        public String name;
    }
}
