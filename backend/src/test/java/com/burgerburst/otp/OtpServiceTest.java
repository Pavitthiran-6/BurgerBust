package com.burgerburst.otp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.burgerburst.config.ApplicationProperties;
import com.burgerburst.email.EmailService;
import com.burgerburst.exception.InvalidOtpException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OtpServiceTest {

    private static final Instant NOW = Instant.parse("2026-07-21T12:00:00Z");

    private OtpService otpService;
    private AtomicReference<String> deliveredOtp;
    private MutableClock clock;

    @BeforeEach
    void setUp() {
        ApplicationProperties properties = new ApplicationProperties(
                new ApplicationProperties.Jwt("unused", Duration.ofDays(7)),
                new ApplicationProperties.Cors(List.of("http://localhost:5173")),
                new ApplicationProperties.Otp(Duration.ofMinutes(5), 6, 3),
                new ApplicationProperties.Integrations("", "", ""));
        OtpValidator validator = new OtpValidator();
        OtpCache cache = new InMemoryOtpCache(validator);
        deliveredOtp = new AtomicReference<>();
        EmailService emailService = (recipient, otp, expiresAt) -> deliveredOtp.set(otp);
        clock = new MutableClock(NOW);
        otpService = new OtpService(
                new OtpGenerator(properties), validator, cache, emailService, properties, clock);
    }

    @Test
    void issuesAndConsumesAnOtp() {
        OtpChallenge challenge = otpService.issue(" Customer@Example.com ");

        assertThat(challenge.email()).isEqualTo("customer@example.com");
        assertThat(challenge.expiresAt()).isEqualTo(NOW.plus(Duration.ofMinutes(5)));
        assertThat(deliveredOtp.get()).matches("\\d{6}");

        otpService.verify("customer@example.com", deliveredOtp.get());
        assertThatThrownBy(() -> otpService.verify("customer@example.com", deliveredOtp.get()))
                .isInstanceOf(InvalidOtpException.class)
                .hasMessage("No active OTP request was found");
    }

    @Test
    void removesChallengeAfterMaximumFailedAttempts() {
        otpService.issue("customer@example.com");

        assertThatThrownBy(() -> otpService.verify("customer@example.com", "111111"))
                .isInstanceOf(InvalidOtpException.class)
                .hasMessage("OTP is invalid");
        assertThatThrownBy(() -> otpService.verify("customer@example.com", "222222"))
                .isInstanceOf(InvalidOtpException.class)
                .hasMessage("OTP is invalid");
        assertThatThrownBy(() -> otpService.verify("customer@example.com", "333333"))
                .isInstanceOf(InvalidOtpException.class)
                .hasMessage("OTP attempt limit exceeded");
    }

    @Test
    void rejectsAnExpiredOtp() {
        otpService.issue("customer@example.com");
        String otp = deliveredOtp.get();
        clock.advance(Duration.ofMinutes(6));

        assertThatThrownBy(() -> otpService.verify("customer@example.com", otp))
                .isInstanceOf(InvalidOtpException.class)
                .hasMessage("OTP has expired");
    }

    private static final class MutableClock extends Clock {

        private Instant currentInstant;

        private MutableClock(Instant currentInstant) {
            this.currentInstant = currentInstant;
        }

        void advance(Duration duration) {
            currentInstant = currentInstant.plus(duration);
        }

        @Override
        public ZoneOffset getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return currentInstant;
        }
    }
}
