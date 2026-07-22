package com.burgerburst.dto.payment;

import jakarta.validation.constraints.Size;

public record RefundPaymentRequest(@Size(max = 500) String reason) {
}

