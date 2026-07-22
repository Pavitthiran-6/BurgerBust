package com.burgerburst.dto.product;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProductResponse(
        UUID uuid,
        String name,
        String description,
        BigDecimal price,
        BigDecimal offerPrice,
        BigDecimal effectivePrice,
        String imageUrl,
        UUID categoryUuid,
        String categoryName,
        boolean available,
        boolean visible,
        boolean featured,
        boolean recommended,
        boolean bestseller,
        boolean popular,
        BigDecimal rating,
        int reviewCount,
        int preparationTime,
        Integer calories,
        boolean veg,
        Instant createdAt,
        Instant updatedAt) {
}
