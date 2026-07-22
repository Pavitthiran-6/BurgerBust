package com.burgerburst.event;

import com.burgerburst.entity.NotificationType;
import java.util.UUID;

public record CommerceNotificationEvent(
        UUID userUuid,
        NotificationType type,
        String title,
        String message,
        UUID orderUuid) {
}

