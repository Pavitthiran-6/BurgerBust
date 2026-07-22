package com.burgerburst.dto.order;

import com.burgerburst.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateOrderRequest(
        @NotNull @Valid DeliveryAddressRequest address,
        @NotNull PaymentMethod paymentMethod,
        @PositiveOrZero int rewardPoints) {
}

