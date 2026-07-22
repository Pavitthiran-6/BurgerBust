package com.burgerburst.config;

import com.burgerburst.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitFilter extends OncePerRequestFilter {

    private final ProductionProperties properties;
    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public RateLimitFilter(ProductionProperties properties, ObjectMapper objectMapper, Clock clock) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.clock = clock;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !properties.rateLimitEnabled()
                || "OPTIONS".equalsIgnoreCase(request.getMethod())
                || !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        Limit limit = limitFor(request.getRequestURI());
        Instant now = clock.instant();
        String key = request.getRemoteAddr() + '|' + limit.category();
        Decision decision = consume(key, limit, now);
        response.setHeader("X-RateLimit-Limit", Integer.toString(limit.requests()));
        response.setHeader("X-RateLimit-Remaining", Integer.toString(decision.remaining()));
        response.setHeader("X-RateLimit-Reset", Long.toString(decision.resetAt().getEpochSecond()));
        if (!decision.allowed()) {
            long retryAfter = Math.max(1, Duration.between(now, decision.resetAt()).toSeconds());
            response.setStatus(429);
            response.setHeader("Retry-After", Long.toString(retryAfter));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getOutputStream(), ApiResponse.failure("Too many requests; try again later"));
            return;
        }
        if (windows.size() > 20_000) windows.entrySet().removeIf(entry -> entry.getValue().resetAt().isBefore(now));
        filterChain.doFilter(request, response);
    }

    private Decision consume(String key, Limit limit, Instant now) {
        Window updated = windows.compute(key, (ignored, current) -> {
            if (current == null || !now.isBefore(current.resetAt())) {
                return new Window(1, now.plus(limit.window()));
            }
            return new Window(current.count() + 1, current.resetAt());
        });
        boolean allowed = updated.count() <= limit.requests();
        return new Decision(allowed, Math.max(0, limit.requests() - updated.count()), updated.resetAt());
    }

    private Limit limitFor(String uri) {
        if (uri.equals("/api/v1/auth/send-otp")) {
            return new Limit("otp", properties.otpRequests(), properties.otpWindow());
        }
        if (uri.startsWith("/api/v1/auth/")) {
            return new Limit("authentication", properties.authenticationRequests(), properties.authenticationWindow());
        }
        if (uri.equals("/api/v1/analytics/events")) {
            return new Limit("analytics", properties.analyticsRequests(), properties.generalWindow());
        }
        return new Limit("general", properties.generalRequests(), properties.generalWindow());
    }

    private record Limit(String category, int requests, Duration window) {
    }

    private record Window(int count, Instant resetAt) {
    }

    private record Decision(boolean allowed, int remaining, Instant resetAt) {
    }
}
