package com.burgerburst.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyPaymentRequest(
        @NotBlank @Size(max = 100) String razorpayOrderId,
        @NotBlank @Size(max = 100) String razorpayPaymentId,
        @NotBlank @Size(max = 256) String razorpaySignature) {
}

