package com.burgerburst.dto.payment;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreatePaymentRequest(@NotNull UUID orderId) {
}

