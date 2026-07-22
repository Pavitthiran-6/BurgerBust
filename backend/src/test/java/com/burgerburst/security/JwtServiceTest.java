package com.burgerburst.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.burgerburst.config.ApplicationProperties;
import com.burgerburst.entity.Role;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final Instant NOW = Instant.parse("2026-07-21T12:00:00Z");

    private JwtService jwtService;
    private UserPrincipal principal;

    @BeforeEach
    void setUp() {
        String secret = Base64.getEncoder().encodeToString(new byte[32]);
        ApplicationProperties properties = new ApplicationProperties(
                new ApplicationProperties.Jwt(secret, Duration.ofDays(7)),
                new ApplicationProperties.Cors(List.of("http://localhost:5173")),
                new ApplicationProperties.Otp(Duration.ofMinutes(5), 6, 5),
                new ApplicationProperties.Integrations("", "", ""));
        jwtService = new JwtService(properties, Clock.fixed(NOW, ZoneOffset.UTC));
        jwtService.initializeSigningKey();
        principal = new UserPrincipal(
                UUID.fromString("a1aa1234-bbbb-4ccc-8ddd-123456789abc"),
                "customer@example.com",
                Role.ROLE_CUSTOMER,
                true,
                true);
    }

    @Test
    void createsASevenDayHs256AccessToken() {
        String token = jwtService.generateAccessToken(principal);

        assertThat(jwtService.extractUsername(token)).isEqualTo(principal.email());
        assertThat(jwtService.extractExpiration(token)).isEqualTo(NOW.plus(Duration.ofDays(7)));
        assertThat(jwtService.isTokenValid(token, principal)).isTrue();
    }

    @Test
    void rejectsTokenForAnotherUser() {
        String token = jwtService.generateAccessToken(principal);
        UserPrincipal anotherUser = new UserPrincipal(
                UUID.randomUUID(), "other@example.com", Role.ROLE_CUSTOMER, true, true);

        assertThat(jwtService.isTokenValid(token, anotherUser)).isFalse();
    }
}
