package com.burgerburst.dto.review;

import com.burgerburst.entity.ReviewType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record ReviewRequest(
        @NotNull ReviewType type,
        @NotNull UUID orderId,
        UUID productId,
        @Min(1) @Max(5) int rating,
        @Size(max = 2000) String comment) {
}

