package com.burgerburst.dto.cart;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemResponse(
        UUID itemId,
        UUID productId,
        String name,
        String imageUrl,
        String category,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal previousUnitPrice,
        BigDecimal lineTotal,
        boolean priceChanged,
        boolean productAvailable,
        boolean stockAvailable,
        int availableStock) {
}

