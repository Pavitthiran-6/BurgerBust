package com.burgerburst.email;

import java.time.Instant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("local")
public class LocalEmailService implements EmailService {

    @Override
    public void sendOtp(String recipientEmail, String otp, Instant expiresAt) {
        log.info("Local OTP delivery recipient={} otp={} expiresAt={}", recipientEmail, otp, expiresAt);
    }
}
