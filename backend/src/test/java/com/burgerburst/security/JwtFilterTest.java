package com.burgerburst.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.burgerburst.config.ApplicationProperties;
import com.burgerburst.entity.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;

class JwtFilterTest {

    private static final String EMAIL = "customer@example.com";

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticatesAValidBearerToken() throws Exception {
        JwtService jwtService = jwtService(secret((byte) 1), Clock.systemUTC());
        UserPrincipal principal = principal(true);
        String token = jwtService.generateAccessToken(principal);
        MockHttpServletResponse response = execute(jwtService, principal, token);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo(principal);
    }

    @Test
    void rejectsMalformedJwtWithUnauthorizedResponse() throws Exception {
        JwtService jwtService = jwtService(secret((byte) 1), Clock.systemUTC());

        MockHttpServletResponse response = execute(jwtService, principal(true), "not-a-jwt");

        assertUnauthorized(response);
    }

    @Test
    void rejectsExpiredJwtWithUnauthorizedResponse() throws Exception {
        JwtService oldJwtService = jwtService(
                secret((byte) 1),
                Clock.fixed(Instant.parse("2020-01-01T00:00:00Z"), ZoneOffset.UTC));
        UserPrincipal principal = principal(true);
        String expiredToken = oldJwtService.generateAccessToken(principal);

        MockHttpServletResponse response = execute(oldJwtService, principal, expiredToken);

        assertUnauthorized(response);
    }

    @Test
    void rejectsJwtWithWrongSignature() throws Exception {
        JwtService trustedService = jwtService(secret((byte) 1), Clock.systemUTC());
        JwtService foreignService = jwtService(secret((byte) 2), Clock.systemUTC());
        UserPrincipal principal = principal(true);
        String foreignToken = foreignService.generateAccessToken(principal);

        MockHttpServletResponse response = execute(trustedService, principal, foreignToken);

        assertUnauthorized(response);
    }

    @Test
    void rejectsDisabledUserWithForbiddenResponse() throws Exception {
        JwtService jwtService = jwtService(secret((byte) 1), Clock.systemUTC());
        String token = jwtService.generateAccessToken(principal(true));

        MockHttpServletResponse response = execute(jwtService, principal(false), token);

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("You do not have permission");
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    private MockHttpServletResponse execute(
            JwtService jwtService,
            UserPrincipal loadedPrincipal,
            String token) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
        JwtAuthenticationEntryPoint entryPoint = new JwtAuthenticationEntryPoint(objectMapper);
        JsonAccessDeniedHandler deniedHandler = new JsonAccessDeniedHandler(objectMapper);
        UserDetailsService userDetailsService = username -> loadedPrincipal;
        JwtFilter filter = new JwtFilter(jwtService, userDetailsService, entryPoint, deniedHandler);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/users/me");
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }

    private void assertUnauthorized(MockHttpServletResponse response) throws Exception {
        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("Authentication is required");
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    private JwtService jwtService(String secret, Clock clock) {
        ApplicationProperties properties = new ApplicationProperties(
                new ApplicationProperties.Jwt(secret, Duration.ofDays(7)),
                new ApplicationProperties.Cors(List.of("http://localhost:5173")),
                new ApplicationProperties.Otp(Duration.ofMinutes(5), 6, 5),
                new ApplicationProperties.Integrations("", "", ""));
        JwtService jwtService = new JwtService(properties, clock);
        jwtService.initializeSigningKey();
        return jwtService;
    }

    private String secret(byte value) {
        byte[] bytes = new byte[32];
        Arrays.fill(bytes, value);
        return Base64.getEncoder().encodeToString(bytes);
    }

    private UserPrincipal principal(boolean active) {
        return new UserPrincipal(
                UUID.fromString("a1aa1234-bbbb-4ccc-8ddd-123456789abc"),
                EMAIL,
                Role.ROLE_CUSTOMER,
                active,
                true);
    }
}
