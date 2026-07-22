package com.burgerburst.controller;

import com.burgerburst.dto.payment.PaymentResponse;
import com.burgerburst.dto.payment.RefundPaymentRequest;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.security.AdminOnly;
import com.burgerburst.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AdminOnly
@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
@Tag(name = "Admin Payments")
public class AdminPaymentController {

    private final PaymentService paymentService;

    @PostMapping("/{orderId}/refund")
    @Operation(summary = "Initiate a full source refund for a successful payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> refund(
            @PathVariable UUID orderId,
            @Valid @RequestBody(required = false) RefundPaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Refund initiated", paymentService.refund(orderId, request == null ? null : request.reason())));
    }
}

