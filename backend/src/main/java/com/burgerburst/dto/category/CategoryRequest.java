package com.burgerburst.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 500) String description,
        @Size(max = 1000) String imageUrl,
        @PositiveOrZero int displayOrder,
        boolean active) {
}
