package com.burgerburst.otp;

import com.burgerburst.config.ApplicationProperties;
import com.burgerburst.email.EmailService;
import com.burgerburst.exception.InvalidOtpException;
import java.time.Clock;
import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private final OtpGenerator otpGenerator;
    private final OtpValidator otpValidator;
    private final OtpCache otpCache;
    private final EmailService emailService;
    private final ApplicationProperties properties;
    private final Clock clock;

    public OtpService(
            OtpGenerator otpGenerator,
            OtpValidator otpValidator,
            OtpCache otpCache,
            EmailService emailService,
            ApplicationProperties properties,
            Clock clock) {
        this.otpGenerator = otpGenerator;
        this.otpValidator = otpValidator;
        this.otpCache = otpCache;
        this.emailService = emailService;
        this.properties = properties;
        this.clock = clock;
    }

    public OtpChallenge issue(String email) {
        String normalizedEmail = otpValidator.normalizeEmail(email);
        String otp = otpGenerator.generate();
        Instant expiresAt = clock.instant().plus(properties.otp().expiry());
        otpCache.store(
                normalizedEmail,
                otpValidator.digest(normalizedEmail, otp),
                expiresAt,
                properties.otp().maxAttempts());
        emailService.sendOtp(normalizedEmail, otp, expiresAt);
        return new OtpChallenge(normalizedEmail, expiresAt);
    }

    public void verify(String email, String otp) {
        String normalizedEmail = otpValidator.normalizeEmail(email);
        if (otp == null || !otp.matches("\\d{" + properties.otp().length() + "}")) {
            throw new InvalidOtpException("OTP format is invalid");
        }
        OtpCache.ValidationResult result = otpCache.validateAndConsume(
                normalizedEmail,
                otpValidator.digest(normalizedEmail, otp),
                clock.instant());

        switch (result) {
            case VALID -> { }
            case NOT_FOUND -> throw new InvalidOtpException("No active OTP request was found");
            case EXPIRED -> throw new InvalidOtpException("OTP has expired");
            case INVALID -> throw new InvalidOtpException("OTP is invalid");
            case ATTEMPTS_EXHAUSTED -> throw new InvalidOtpException("OTP attempt limit exceeded");
        }
    }
}
