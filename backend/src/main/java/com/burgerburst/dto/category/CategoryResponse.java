package com.burgerburst.dto.category;

import java.time.Instant;
import java.util.UUID;

public record CategoryResponse(
        UUID uuid,
        String name,
        String description,
        String imageUrl,
        int displayOrder,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {
}
