
package com.worksphere.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CurrentTenantServiceTest {

    private CurrentTenantService currentTenantService;

    @BeforeEach
    void setUp() {
        currentTenantService = new CurrentTenantService();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void returnsOrganizationIdFromAuthenticatedPrincipal() {
        authenticate(createPrincipal(10L, 100L));

        assertEquals(
                100L,
                currentTenantService.getCurrentOrganizationId()
        );
    }

    @Test
    void returnsUserIdFromAuthenticatedPrincipal() {
        authenticate(createPrincipal(10L, 100L));

        assertEquals(
                10L,
                currentTenantService.getCurrentUserId()
        );
    }

    @Test
    void deniesAccessWhenAuthenticationIsMissing() {
        assertThrows(
                AccessDeniedException.class,
                () -> currentTenantService.getCurrentOrganizationId()
        );

        assertThrows(
                AccessDeniedException.class,
                () -> currentTenantService.getCurrentUserId()
        );
    }

    @Test
    void deniesAccessWhenPrincipalIsNotWorksphereUserPrincipal() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "untrusted-user",
                        "password",
                        List.of()
                )
        );

        assertThrows(
                AccessDeniedException.class,
                () -> currentTenantService.getCurrentOrganizationId()
        );

        assertThrows(
                AccessDeniedException.class,
                () -> currentTenantService.getCurrentUserId()
        );
    }

    private void authenticate(WorksphereUserPrincipal principal) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        principal.getAuthorities()
                )
        );
    }

    private WorksphereUserPrincipal createPrincipal(
            Long userId,
            Long organizationId
    ) {
        return new WorksphereUserPrincipal(
                userId,
                organizationId,
                "admin@example.com",
                "encoded-password",
                "ORG_ADMIN",
                true
        );
    }
}