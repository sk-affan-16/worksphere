package com.worksphere.organization;

import com.worksphere.organization.dto.OrganizationResponse;
import com.worksphere.organization.dto.UpdateOrganizationRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(
            OrganizationService organizationService
    ) {
        this.organizationService = organizationService;
    }

    @GetMapping("/me")
    public OrganizationResponse getCurrentOrganization() {
        return organizationService.getCurrentOrganization();
    }

    @PatchMapping("/me")
    public OrganizationResponse updateCurrentOrganization(
            @Valid @RequestBody UpdateOrganizationRequest request
    ) {
        return organizationService.updateCurrentOrganization(request);
    }
}