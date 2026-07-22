package com.burgerburst.dto.admin;

import com.burgerburst.entity.DiscountType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminCouponResponse(
        UUID id,
        String code,
        String description,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal maximumDiscount,
        BigDecimal minimumOrderAmount,
        Instant validFrom,
        Instant expiresAt,
        Integer totalUsageLimit,
        int perCustomerLimit,
        boolean newCustomersOnly,
        boolean active,
        long usageCount,
        BigDecimal discountGranted,
        Instant createdAt) {
}
