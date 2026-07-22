package com.burgerburst.controller;

import com.burgerburst.dto.admin.AdminCouponRequest;
import com.burgerburst.dto.admin.AdminCouponResponse;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.security.AdminOnly;
import com.burgerburst.service.AdminCouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AdminOnly
@RestController
@RequestMapping("/api/v1/admin/coupons")
@RequiredArgsConstructor
@Tag(name = "Admin Coupons")
public class AdminCouponController {

    private final AdminCouponService couponService;

    @GetMapping
    @Operation(summary = "List coupons with usage and granted-discount analytics")
    public ResponseEntity<ApiResponse<List<AdminCouponResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success("Coupons retrieved", couponService.list()));
    }

    @PostMapping
    @Operation(summary = "Create a coupon")
    public ResponseEntity<ApiResponse<AdminCouponResponse>> create(
            @Valid @RequestBody AdminCouponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created", couponService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edit a coupon")
    public ResponseEntity<ApiResponse<AdminCouponResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody AdminCouponRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Coupon updated", couponService.update(id, request)));
    }

    @PatchMapping("/{id}/expire")
    @Operation(summary = "Expire a coupon immediately")
    public ResponseEntity<ApiResponse<AdminCouponResponse>> expire(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Coupon expired", couponService.expire(id)));
    }
}
