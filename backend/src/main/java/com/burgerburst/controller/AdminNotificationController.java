package com.burgerburst.controller;

import com.burgerburst.dto.admin.BroadcastNotificationRequest;
import com.burgerburst.dto.admin.BroadcastNotificationResponse;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.response.PageResponse;
import com.burgerburst.security.AdminOnly;
import com.burgerburst.security.UserPrincipal;
import com.burgerburst.service.AdminNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@AdminOnly
@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
@Tag(name = "Admin Notifications")
public class AdminNotificationController {

    private final AdminNotificationService notificationService;

    @PostMapping("/broadcast")
    @Operation(summary = "Broadcast an announcement to every active customer")
    public ResponseEntity<ApiResponse<BroadcastNotificationResponse>> broadcast(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BroadcastNotificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Notification broadcast", notificationService.broadcast(principal.uuid(), request)));
    }

    @GetMapping("/broadcasts")
    @Operation(summary = "Get broadcast history")
    public ResponseEntity<ApiResponse<PageResponse<BroadcastNotificationResponse>>> history(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Broadcast history retrieved", notificationService.history(page, size)));
    }
}
