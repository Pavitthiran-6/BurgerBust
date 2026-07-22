package com.burgerburst.dto.auth;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        long expiresIn,
        String tokenType) {
}
