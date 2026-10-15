package com.worksphere.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class WorksphereUserPrincipalTest {

    @Test
    void shouldExposeAuthenticatedUserAndOrganizationIds() {
        WorksphereUserPrincipal principal =
                new WorksphereUserPrincipal(
                        10L,
                        20L,
                        "admin@example.com",
                        "test-password-hash",
                        "ORG_ADMIN",
                        true
                );

        assertEquals(10L, principal.getUserId());
        assertEquals(20L, principal.getOrganizationId());
        assertEquals("admin@example.com", principal.getUsername());
        assertEquals("ORG_ADMIN", principal.getRole());
        assertTrue(principal.isEnabled());
    }

    @Test
    void shouldExposeRoleAsSpringSecurityAuthority() {
        WorksphereUserPrincipal principal =
                new WorksphereUserPrincipal(
                        10L,
                        20L,
                        "employee@example.com",
                        "test-password-hash",
                        "EMPLOYEE",
                        true
                );

        List<String> authorities = principal.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        assertEquals(List.of("ROLE_EMPLOYEE"), authorities);
    }

    @Test
    void shouldExposeDisabledStatus() {
        WorksphereUserPrincipal principal =
                new WorksphereUserPrincipal(
                        10L,
                        20L,
                        "disabled@example.com",
                        "test-password-hash",
                        "EMPLOYEE",
                        false
                );

        assertFalse(principal.isEnabled());
    }

    @Test
    void shouldRejectMissingOrganizationId() {
        assertThrows(
                NullPointerException.class,
                () -> new WorksphereUserPrincipal(
                        10L,
                        null,
                        "admin@example.com",
                        "test-password-hash",
                        "ORG_ADMIN",
                        true
                )
        );
    }
}