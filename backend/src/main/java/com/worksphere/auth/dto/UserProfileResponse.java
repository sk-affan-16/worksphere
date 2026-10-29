
package com.worksphere.auth.dto;

public record UserProfileResponse(
        Long userId,
        Long organizationId,
        String email,
        String role
) {
}
