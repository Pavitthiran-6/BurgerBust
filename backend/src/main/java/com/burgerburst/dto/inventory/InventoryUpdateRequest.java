package com.burgerburst.dto.inventory;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record InventoryUpdateRequest(
        @PositiveOrZero int stockQuantity,
        @PositiveOrZero int lowStockThreshold,
        boolean visible,
        @Size(max = 500) String reason) {
}
