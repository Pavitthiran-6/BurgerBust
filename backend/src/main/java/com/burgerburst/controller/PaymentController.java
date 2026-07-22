package com.burgerburst.controller;

import com.burgerburst.dto.payment.CreatePaymentRequest;
import com.burgerburst.dto.payment.PaymentResponse;
import com.burgerburst.dto.payment.VerifyPaymentRequest;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.security.AuthenticatedUser;
import com.burgerburst.security.UserPrincipal;
import com.burgerburst.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments")
public class PaymentController {

    private final PaymentService paymentService;

    @AuthenticatedUser
    @PostMapping("/create-order")
    @Operation(summary = "Create an idempotent Razorpay order for a BurgerBurst order")
    public ResponseEntity<ApiResponse<PaymentResponse>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader("Idempotency-Key") @NotBlank @Size(max = 120) String idempotencyKey,
            @Valid @RequestBody CreatePaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Payment order created", paymentService.create(principal.uuid(), request, idempotencyKey)));
    }

    @AuthenticatedUser
    @PostMapping("/verify")
    @Operation(summary = "Verify the Razorpay checkout signature and confirm payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> verify(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody VerifyPaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment verified", paymentService.verify(principal.uuid(), request)));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Verify and process an idempotent Razorpay webhook")
    public ResponseEntity<ApiResponse<Void>> webhook(
            @RequestHeader("X-Razorpay-Signature") String signature,
            @RequestHeader(value = "X-Razorpay-Event-Id", required = false) String eventId,
            @RequestBody String rawBody) {
        paymentService.processWebhook(rawBody, signature, eventId);
        return ResponseEntity.ok(ApiResponse.success("Webhook processed", null));
    }

    @AuthenticatedUser
    @GetMapping("/{orderId}")
    @Operation(summary = "Get all payment attempts for an order")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment history retrieved", paymentService.getHistory(principal.uuid(), orderId)));
    }
}

