package com.worksphere.auth.dto;

public record LoginResponse(
        String accessToken,
        String tokenType
) {
}