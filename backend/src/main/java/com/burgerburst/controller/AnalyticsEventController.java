package com.burgerburst.controller;

import com.burgerburst.dto.admin.AnalyticsEventRequest;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.security.UserPrincipal;
import com.burgerburst.service.AnalyticsEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics/events")
@RequiredArgsConstructor
@Tag(name = "Analytics Events")
public class AnalyticsEventController {

    private final AnalyticsEventService analyticsEventService;

    @PostMapping
    @Operation(summary = "Record a privacy-minimized storefront funnel event")
    public ResponseEntity<ApiResponse<Void>> record(
            @Valid @RequestBody AnalyticsEventRequest request, Authentication authentication) {
        UserPrincipal principal = authentication != null && authentication.getPrincipal() instanceof UserPrincipal user
                ? user : null;
        analyticsEventService.record(request, principal == null ? null : principal.uuid());
        return ResponseEntity.accepted().body(ApiResponse.success("Analytics event accepted", null));
    }
}
