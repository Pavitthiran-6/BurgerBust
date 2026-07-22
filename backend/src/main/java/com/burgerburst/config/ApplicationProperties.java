package com.burgerburst.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app")
public record ApplicationProperties(
        @Valid Jwt jwt,
        @Valid Cors cors,
        @Valid Otp otp,
        @Valid Integrations integrations) {

    public record Jwt(
            @NotBlank String secret,
            @NotNull Duration accessTokenExpiry) {

        @AssertTrue(message = "JWT access-token expiry must be positive")
        public boolean isAccessTokenExpiryPositive() {
            return accessTokenExpiry != null && !accessTokenExpiry.isNegative() && !accessTokenExpiry.isZero();
        }
    }

    public record Cors(@NotEmpty List<@NotBlank String> allowedOrigins) {

        @AssertTrue(message = "CORS origins must be explicit when credentials are enabled")
        public boolean isExplicit() {
            return allowedOrigins != null && allowedOrigins.stream().noneMatch("*"::equals);
        }
    }

    public record Otp(
            @NotNull Duration expiry,
            @Positive int length,
            @Positive int maxAttempts) {

        @AssertTrue(message = "OTP expiry must be positive")
        public boolean isExpiryPositive() {
            return expiry != null && !expiry.isNegative() && !expiry.isZero();
        }
    }

    public record Integrations(String brevoApiKey, String razorpayKeyId, String razorpayKeySecret) {
    }
}
