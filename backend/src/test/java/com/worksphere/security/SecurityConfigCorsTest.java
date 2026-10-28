
package com.worksphere.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class SecurityConfigCorsTest {

    @Test
    void allowsConfiguredOriginsAndRejectsUnapprovedOrigins() {
        JwtAuthenticationFilter filter =
                mock(JwtAuthenticationFilter.class);

        SecurityConfig securityConfig = new SecurityConfig(filter);

        ReflectionTestUtils.setField(
                securityConfig,
                "allowedOrigins",
                "http://localhost:4200,https://app.example.com"
        );

        CorsConfigurationSource source =
                securityConfig.corsConfigurationSource();

        MockHttpServletRequest request =
                new MockHttpServletRequest("GET", "/api/employees");

        CorsConfiguration cors = source.getCorsConfiguration(request);

        assertNotNull(cors);
        assertEquals(
                List.of(
                        "http://localhost:4200",
                        "https://app.example.com"
                ),
                cors.getAllowedOrigins()
        );

        assertNotNull(cors.checkOrigin("https://app.example.com"));
        assertNull(cors.checkOrigin("https://unapproved.example.com"));
        assertFalse(cors.getAllowCredentials());
    }
}
