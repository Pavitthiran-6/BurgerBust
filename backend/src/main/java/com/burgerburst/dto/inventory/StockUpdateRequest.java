package com.burgerburst.dto.inventory;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record StockUpdateRequest(
        @PositiveOrZero int quantity,
        @Size(max = 500) String reason) {
}
