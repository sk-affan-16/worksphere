package com.worksphere.auth.dto;

public record UserProfileResponse(
        Long userId,
        Long organizationId,
        String email,
        String role,
        String firstName,
        String lastName,
        String jobTitle,
        String profilePhotoUrl
) {
}