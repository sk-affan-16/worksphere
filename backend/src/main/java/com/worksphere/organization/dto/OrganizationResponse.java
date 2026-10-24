package com.worksphere.organization.dto;

import com.worksphere.organization.Organization;
import java.time.Instant;

public record OrganizationResponse(
        Long id,
        String name,
        Organization.Status status,
        Instant createdAt
) {
    public static OrganizationResponse from(Organization organization) {
        return new OrganizationResponse(
                organization.getId(),
                organization.getName(),
                organization.getStatus(),
                organization.getCreatedAt()
        );
    }
}