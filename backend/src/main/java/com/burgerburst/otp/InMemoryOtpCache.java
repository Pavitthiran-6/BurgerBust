package com.burgerburst.otp;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicReference;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InMemoryOtpCache implements OtpCache {

    private final ConcurrentMap<String, Entry> entries = new ConcurrentHashMap<>();
    private final OtpValidator otpValidator;

    @Override
    public void store(String email, String digest, Instant expiresAt, int maxAttempts) {
        entries.put(email, new Entry(digest, expiresAt, maxAttempts));
    }

    @Override
    public ValidationResult validateAndConsume(String email, String digest, Instant now) {
        AtomicReference<ValidationResult> result = new AtomicReference<>(ValidationResult.NOT_FOUND);
        entries.compute(email, (key, entry) -> {
            if (entry == null) {
                result.set(ValidationResult.NOT_FOUND);
                return null;
            }
            if (!entry.expiresAt().isAfter(now)) {
                result.set(ValidationResult.EXPIRED);
                return null;
            }
            if (otpValidator.matches(entry.digest(), digest)) {
                result.set(ValidationResult.VALID);
                return null;
            }
            int attemptsRemaining = entry.attemptsRemaining() - 1;
            if (attemptsRemaining <= 0) {
                result.set(ValidationResult.ATTEMPTS_EXHAUSTED);
                return null;
            }
            result.set(ValidationResult.INVALID);
            return new Entry(entry.digest(), entry.expiresAt(), attemptsRemaining);
        });
        return result.get();
    }

    private record Entry(String digest, Instant expiresAt, int attemptsRemaining) {
    }
}
