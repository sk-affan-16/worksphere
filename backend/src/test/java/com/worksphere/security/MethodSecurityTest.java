
package com.worksphere.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Import(MethodSecurityTest.TestConfig.class)
class MethodSecurityTest {

    @Autowired
    private RoleProtectedService roleProtectedService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void orgAdminShouldAccessAdminOperation() {
        authenticateAs("ORG_ADMIN");

        assertDoesNotThrow(
                () -> roleProtectedService.adminOperation()
        );
    }

    @Test
    void employeeShouldBeDeniedAdminOperation() {
        authenticateAs("EMPLOYEE");

        assertThrows(
                AccessDeniedException.class,
                () -> roleProtectedService.adminOperation()
        );
    }

    private void authenticateAs(String role) {
        TestingAuthenticationToken authentication =
                new TestingAuthenticationToken(
                        "test-user",
                        "test-password",
                        "ROLE_" + role
                );

        authentication.setAuthenticated(true);

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);
    }

    @TestConfiguration
    @EnableMethodSecurity
    static class TestConfig {

        @Bean
        RoleProtectedService roleProtectedService() {
            return new RoleProtectedService();
        }
    }

    @Service
    static class RoleProtectedService {

        @PreAuthorize("hasRole('ORG_ADMIN')")
        public void adminOperation() {
            // Test-only protected operation.
        }
    }
}
