package com.worksphere.security;

import com.worksphere.organization.Organization;
import com.worksphere.user.User;
import com.worksphere.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DatabaseUserDetailsServiceTest {

    private UserRepository userRepository;
    private DatabaseUserDetailsService userDetailsService;

    private Organization organization;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        userDetailsService = new DatabaseUserDetailsService(userRepository);

        organization = mock(Organization.class);
        when(organization.getId()).thenReturn(20L);
        when(organization.getStatus())
                .thenReturn(Organization.Status.ACTIVE);
    }

    @Test
    void shouldMapActiveAdminToPrincipal() {
        User user = createUser(
                User.Role.ORG_ADMIN,
                User.Status.ACTIVE
        );

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.of(user));

        var principal = userDetailsService.loadUserByUsername(
                "  ADMIN@example.com  "
        );

        assertInstanceOf(WorksphereUserPrincipal.class, principal);

        WorksphereUserPrincipal workspherePrincipal =
                (WorksphereUserPrincipal) principal;

        assertEquals(10L, workspherePrincipal.getUserId());
        assertEquals(20L, workspherePrincipal.getOrganizationId());
        assertEquals("admin@example.com", workspherePrincipal.getUsername());
        assertEquals("ORG_ADMIN", workspherePrincipal.getRole());
        assertTrue(workspherePrincipal.isEnabled());

        assertTrue(workspherePrincipal.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ORG_ADMIN")));

        verify(userRepository).findByEmail("admin@example.com");
    }

    @Test
    void shouldMapEmployeeRoleCorrectly() {
        User user = createUser(
                User.Role.EMPLOYEE,
                User.Status.ACTIVE
        );

        when(userRepository.findByEmail("employee@example.com"))
                .thenReturn(Optional.of(user));

        WorksphereUserPrincipal principal =
                (WorksphereUserPrincipal)
                        userDetailsService.loadUserByUsername(
                                "employee@example.com"
                        );

        assertEquals("EMPLOYEE", principal.getRole());
        assertTrue(principal.isEnabled());

        assertTrue(principal.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_EMPLOYEE")));
    }

    @Test
    void shouldDisableInactiveUser() {
        User user = createUser(
                User.Role.EMPLOYEE,
                User.Status.DISABLED
        );

        when(userRepository.findByEmail("disabled@example.com"))
                .thenReturn(Optional.of(user));

        WorksphereUserPrincipal principal =
                (WorksphereUserPrincipal)
                        userDetailsService.loadUserByUsername(
                                "disabled@example.com"
                        );

        assertFalse(principal.isEnabled());
    }

    @Test
    void shouldDisableUserWhenOrganizationIsInactive() {
        when(organization.getStatus())
                .thenReturn(Organization.Status.INACTIVE);

        User user = createUser(
                User.Role.ORG_ADMIN,
                User.Status.ACTIVE
        );

        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.of(user));

        WorksphereUserPrincipal principal =
                (WorksphereUserPrincipal)
                        userDetailsService.loadUserByUsername(
                                "admin@example.com"
                        );

        assertFalse(principal.isEnabled());
    }

    @Test
    void shouldRejectUnknownEmail() {
        when(userRepository.findByEmail("missing@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(
                UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername(
                        "missing@example.com"
                )
        );
    }

    @Test
    void shouldNormalizeEmailBeforeDatabaseLookup() {
        User user = createUser(
                User.Role.EMPLOYEE,
                User.Status.ACTIVE
        );

        when(userRepository.findByEmail("employee@example.com"))
                .thenReturn(Optional.of(user));

        userDetailsService.loadUserByUsername(
                "  EMPLOYEE@EXAMPLE.COM "
        );

        verify(userRepository).findByEmail("employee@example.com");
    }

    private User createUser(User.Role role, User.Status status) {
        User user = mock(User.class);

        when(user.getId()).thenReturn(10L);
        when(user.getOrganization()).thenReturn(organization);
        when(user.getEmail()).thenReturn(
                role == User.Role.ORG_ADMIN
                        ? "admin@example.com"
                        : "employee@example.com"
        );
        when(user.getPasswordHash()).thenReturn("test-password-hash");
        when(user.getRole()).thenReturn(role);
        when(user.getStatus()).thenReturn(status);

        return user;
    }
}