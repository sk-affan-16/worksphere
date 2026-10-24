package com.worksphere.organization;

import com.worksphere.organization.dto.OrganizationResponse;
import com.worksphere.organization.dto.UpdateOrganizationRequest;
import com.worksphere.security.CurrentTenantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrganizationServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private CurrentTenantService currentTenantService;

    @InjectMocks
    private OrganizationService organizationService;

    private Organization organization;

    @BeforeEach
    void setUp() {
        organization = new Organization("WorkSphere Demo");
    }

    @Test
    void getCurrentOrganizationReturnsAuthenticatedOrganization() {
        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(10L);
        when(organizationRepository.findById(10L))
                .thenReturn(Optional.of(organization));

        OrganizationResponse response =
                organizationService.getCurrentOrganization();

        assertEquals("WorkSphere Demo", response.name());
        verify(organizationRepository).findById(10L);
    }

    @Test
    void getCurrentOrganizationThrowsWhenOrganizationDoesNotExist() {
        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(10L);
        when(organizationRepository.findById(10L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResponseStatusException.class,
                () -> organizationService.getCurrentOrganization()
        );
    }

    @Test
    void updateCurrentOrganizationChangesName() {
        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(10L);
        when(organizationRepository.findById(10L))
                .thenReturn(Optional.of(organization));
        when(organizationRepository.save(organization))
                .thenReturn(organization);

        OrganizationResponse response =
                organizationService.updateCurrentOrganization(
                        new UpdateOrganizationRequest("  New WorkSphere  ")
                );

        assertEquals("New WorkSphere", response.name());
        verify(organizationRepository).save(organization);
    }

    @Test
    void updateCurrentOrganizationThrowsWhenOrganizationDoesNotExist() {
        when(currentTenantService.getCurrentOrganizationId())
                .thenReturn(10L);
        when(organizationRepository.findById(10L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResponseStatusException.class,
                () -> organizationService.updateCurrentOrganization(
                        new UpdateOrganizationRequest("New Name")
                )
        );

        verify(organizationRepository).findById(10L);
    }
}