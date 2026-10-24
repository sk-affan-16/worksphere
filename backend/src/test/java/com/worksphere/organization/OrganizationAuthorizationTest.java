package com.worksphere.organization;

import com.worksphere.organization.dto.UpdateOrganizationRequest;
import com.worksphere.security.CurrentTenantService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@SpringBootTest
class OrganizationAuthorizationTest {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @MockitoBean
    private CurrentTenantService currentTenantService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
        organizationRepository.deleteAll();
    }

    @Test
    void orgAdminCanInvokeOrganizationUpdate() {
        authenticateAs("ORG_ADMIN");
        Organization organization =
                organizationRepository.save(
                        new Organization("Original Name")
                );

        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(organization.getId());

        assertDoesNotThrow(
                () -> organizationService.updateCurrentOrganization(
                        new UpdateOrganizationRequest("Updated Name")
                )
        );
    }

    @Test
    void employeeCannotUpdateOrganization() {
        authenticateAs("EMPLOYEE");

        assertThrows(
                AccessDeniedException.class,
                () -> organizationService.updateCurrentOrganization(
                        new UpdateOrganizationRequest("Updated Name")
                )
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
}