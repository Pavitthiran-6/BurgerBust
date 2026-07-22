package com.burgerburst.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminCustomerResponse(
        UUID id,
        String name,
        String email,
        String phone,
        boolean verified,
        boolean active,
        long ordersCount,
        BigDecimal totalSpent,
        int rewardPoints,
        long couponsUsed,
        Instant lastLogin,
        Instant createdAt) {
}
