package com.worksphere.auth.dto;

public record OrganizationSignupResponse(
        Long organizationId,
        String organizationName,
        Long adminUserId,
        String email,
        String message
) {
}