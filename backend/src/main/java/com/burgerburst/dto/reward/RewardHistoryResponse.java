package com.burgerburst.dto.reward;

import com.burgerburst.entity.RewardTransactionType;
import java.time.Instant;
import java.util.UUID;

public record RewardHistoryResponse(
        UUID id,
        RewardTransactionType type,
        int points,
        int balanceAfter,
        UUID orderId,
        String description,
        Instant createdAt) {
}

