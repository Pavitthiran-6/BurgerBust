package com.burgerburst.controller;

import com.burgerburst.dto.admin.AdminAnalyticsResponse;
import com.burgerburst.dto.admin.AdminDashboardResponse;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.security.AdminOnly;
import com.burgerburst.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@AdminOnly
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard and Analytics")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;
    private final Clock clock;

    @GetMapping("/dashboard")
    @Operation(summary = "Get the production operations dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard retrieved", dashboardService.dashboard()));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get revenue, product, peak-hour, growth, and funnel analytics")
    public ResponseEntity<ApiResponse<AdminAnalyticsResponse>> analytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        Instant safeTo = to == null ? clock.instant() : to;
        Instant safeFrom = from == null ? safeTo.minus(30, ChronoUnit.DAYS) : from;
        return ResponseEntity.ok(ApiResponse.success(
                "Analytics retrieved", dashboardService.analytics(safeFrom, safeTo)));
    }
}
