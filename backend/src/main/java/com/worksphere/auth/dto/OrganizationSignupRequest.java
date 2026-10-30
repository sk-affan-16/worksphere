package com.worksphere.auth.dto;

import com.worksphere.common.validation.Utf8PasswordLength;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OrganizationSignupRequest(
        @NotBlank
        @Size(max = 150)
        String organizationName,

        @NotBlank
        @Email
        @Size(max = 254)
        String email,

        @NotBlank
        @Utf8PasswordLength
        String password
) {
}