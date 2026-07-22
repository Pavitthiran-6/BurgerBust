package com.burgerburst.email;

import java.time.Instant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("prod")
@ConditionalOnProperty(name = "app.email.provider", havingValue = "log", matchIfMissing = true)
public class ProductionSafeEmailService implements EmailService {

    @Override
    public void sendOtp(String recipientEmail, String otp, Instant expiresAt) {
        log.info("OTP delivery request accepted for recipient={} expiresAt={}", recipientEmail, expiresAt);
    }
}
