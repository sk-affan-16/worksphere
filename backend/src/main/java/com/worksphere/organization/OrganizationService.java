package com.worksphere.organization;

import com.worksphere.organization.dto.OrganizationResponse;
import com.worksphere.organization.dto.UpdateOrganizationRequest;
import com.worksphere.security.CurrentTenantService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final CurrentTenantService currentTenantService;

    public OrganizationService(
            OrganizationRepository organizationRepository,
            CurrentTenantService currentTenantService
    ) {
        this.organizationRepository = organizationRepository;
        this.currentTenantService = currentTenantService;
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getCurrentOrganization() {
        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        Organization organization = organizationRepository
                .findById(organizationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Organization not found"
                ));

        return OrganizationResponse.from(organization);
    }

    @Transactional
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public OrganizationResponse updateCurrentOrganization(
            UpdateOrganizationRequest request
    ) {
        Long organizationId =
                currentTenantService.getCurrentOrganizationId();

        Organization organization = organizationRepository
                .findById(organizationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Organization not found"
                ));

        organization.setName(request.name().trim());

        Organization savedOrganization =
                organizationRepository.save(organization);

        return OrganizationResponse.from(savedOrganization);
    }
}