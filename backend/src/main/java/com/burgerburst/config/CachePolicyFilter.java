package com.burgerburst.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public class CachePolicyFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/v1/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        filterChain.doFilter(request, response);
        if (response.containsHeader("Cache-Control")) return;
        boolean publicRead = "GET".equals(request.getMethod())
                && request.getHeader("Authorization") == null
                && (request.getRequestURI().equals("/api/v1/restaurant")
                    || request.getRequestURI().startsWith("/api/v1/categories")
                    || request.getRequestURI().startsWith("/api/v1/products"));
        if (publicRead && response.getStatus() >= 200 && response.getStatus() < 300) {
            response.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
            response.setHeader("Vary", "Origin, Accept-Encoding");
        } else {
            response.setHeader("Cache-Control", "no-store");
        }
    }
}
