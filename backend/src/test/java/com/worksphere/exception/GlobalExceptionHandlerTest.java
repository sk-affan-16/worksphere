package com.worksphere.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new TestController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

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
                @org.springframework.web.bind.annotation.RequestBody TestRequest request) {
            return request;
        }
    }

    static class TestRequest {
        public String name;
    }
}
