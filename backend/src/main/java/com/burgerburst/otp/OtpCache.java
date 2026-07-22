package com.burgerburst.otp;

import java.time.Instant;

public interface OtpCache {

    void store(String email, String digest, Instant expiresAt, int maxAttempts);

    ValidationResult validateAndConsume(String email, String digest, Instant now);

    enum ValidationResult {
        VALID,
        NOT_FOUND,
        EXPIRED,
        INVALID,
        ATTEMPTS_EXHAUSTED
    }
}
