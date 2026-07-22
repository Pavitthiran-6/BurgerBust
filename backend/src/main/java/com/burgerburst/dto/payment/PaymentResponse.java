package com.burgerburst.dto.payment;

import com.burgerburst.entity.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID orderId,
        String orderNumber,
        String keyId,
        String razorpayOrderId,
        String razorpayPaymentId,
        String razorpayRefundId,
        PaymentStatus status,
        BigDecimal amount,
        long amountInSubunits,
        String currency,
        int attemptNumber,
        String failureReason,
        Instant createdAt,
        Instant updatedAt) {
}
