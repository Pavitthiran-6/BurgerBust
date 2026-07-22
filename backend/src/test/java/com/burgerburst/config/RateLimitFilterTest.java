package com.burgerburst.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RateLimitFilterTest {

    private static final Clock CLOCK = Clock.fixed(
            Instant.parse("2026-07-21T10:00:00Z"), ZoneOffset.UTC);

    @Test
    void rejectsRequestsAfterTheOtpLimitAndReturnsRetryMetadata() throws Exception {
        RateLimitFilter filter = filter(true, 2);

        MockHttpServletResponse first = execute(filter, "127.0.0.1", "/api/v1/auth/send-otp");
        MockHttpServletResponse second = execute(filter, "127.0.0.1", "/api/v1/auth/send-otp");
        MockHttpServletResponse third = execute(filter, "127.0.0.1", "/api/v1/auth/send-otp");

        assertThat(first.getStatus()).isEqualTo(200);
        assertThat(second.getStatus()).isEqualTo(200);
        assertThat(third.getStatus()).isEqualTo(429);
        assertThat(third.getHeader("X-RateLimit-Limit")).isEqualTo("2");
        assertThat(third.getHeader("X-RateLimit-Remaining")).isEqualTo("0");
        assertThat(third.getHeader("Retry-After")).isEqualTo("60");
        assertThat(third.getContentAsString()).contains("Too many requests");
    }

    @Test
    void tracksClientsIndependently() throws Exception {
        RateLimitFilter filter = filter(true, 1);

        execute(filter, "10.0.0.1", "/api/v1/auth/send-otp");

        assertThat(execute(filter, "10.0.0.1", "/api/v1/auth/send-otp").getStatus()).isEqualTo(429);
        assertThat(execute(filter, "10.0.0.2", "/api/v1/auth/send-otp").getStatus()).isEqualTo(200);
    }

    @Test
    void leavesNonApiTrafficAndDisabledConfigurationUntouched() throws Exception {
        RateLimitFilter enabled = filter(true, 1);
        RateLimitFilter disabled = filter(false, 1);

        assertThat(execute(enabled, "127.0.0.1", "/actuator/health").getHeader("X-RateLimit-Limit")).isNull();
        assertThat(execute(disabled, "127.0.0.1", "/api/v1/auth/send-otp").getHeader("X-RateLimit-Limit")).isNull();
    }

    private RateLimitFilter filter(boolean enabled, int otpLimit) {
        ProductionProperties properties = new ProductionProperties(
                enabled, 100, 10, otpLimit, 25,
                Duration.ofMinutes(1), Duration.ofMinutes(1), Duration.ofMinutes(1));
        return new RateLimitFilter(properties, new ObjectMapper().findAndRegisterModules(), CLOCK);
    }

    private MockHttpServletResponse execute(RateLimitFilter filter, String remoteAddress, String uri)
            throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", uri);
        request.setRemoteAddr(remoteAddress);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }
}
