package com.burgerburst.dto.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.AssertTrue;

public record StockAdjustmentRequest(
        @Min(-1000000) @Max(1000000) int adjustment,
        @NotBlank @Size(max = 500) String reason) {

    @AssertTrue(message = "Adjustment must not be zero")
    public boolean isNonZero() {
        return adjustment != 0;
    }
}
