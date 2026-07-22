package com.burgerburst.dto.admin;

import java.time.Instant;
import java.util.UUID;

public record BroadcastNotificationResponse(
        UUID id,
        String category,
        String title,
        String message,
        int recipientCount,
        UUID createdBy,
        Instant createdAt) {
}
