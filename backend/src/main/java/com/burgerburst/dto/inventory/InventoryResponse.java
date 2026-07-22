package com.burgerburst.dto.inventory;

import java.time.Instant;
import java.util.UUID;

public record InventoryResponse(
        UUID productUuid,
        String productName,
        String categoryName,
        int stockQuantity,
        int lowStockThreshold,
        boolean lowStock,
        boolean outOfStock,
        boolean visible,
        Instant updatedAt) {
}
