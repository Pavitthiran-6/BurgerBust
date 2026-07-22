package com.burgerburst.dto.admin;

import com.burgerburst.entity.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;

public record AdminCouponRequest(
        @NotBlank @Size(max = 40) @Pattern(regexp = "[A-Za-z0-9_-]+") String code,
        @Size(max = 500) String description,
        @NotNull DiscountType discountType,
        @NotNull @DecimalMin("0.01") BigDecimal discountValue,
        @DecimalMin("0.01") BigDecimal maximumDiscount,
        @NotNull @DecimalMin("0.00") BigDecimal minimumOrderAmount,
        @NotNull Instant validFrom,
        @NotNull Instant expiresAt,
        @Min(1) Integer totalUsageLimit,
        @Min(1) @Max(1000) int perCustomerLimit,
        boolean newCustomersOnly,
        boolean active) {
}
