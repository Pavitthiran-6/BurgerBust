package com.burgerburst.dto.notification;

import com.burgerburst.entity.NotificationType;
import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        NotificationType type,
        String title,
        String message,
        UUID orderId,
        boolean read,
        Instant readAt,
        Instant createdAt) {
}

