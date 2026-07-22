package com.burgerburst.dto.review;

import com.burgerburst.entity.ReviewType;
import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        ReviewType type,
        UUID orderId,
        UUID productId,
        String productName,
        String reviewerName,
        int rating,
        String comment,
        Instant createdAt,
        Instant updatedAt) {
}
