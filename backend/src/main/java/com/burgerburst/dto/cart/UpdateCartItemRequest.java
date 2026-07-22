package com.burgerburst.dto.cart;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record UpdateCartItemRequest(@Min(1) @Max(20) int quantity) {
}

