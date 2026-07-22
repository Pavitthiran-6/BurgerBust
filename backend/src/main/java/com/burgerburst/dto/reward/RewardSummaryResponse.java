package com.burgerburst.dto.reward;

import java.math.BigDecimal;

public record RewardSummaryResponse(
        int balance,
        int totalEarned,
        int totalRedeemed,
        BigDecimal pointValue,
        BigDecimal monetaryValue) {
}

