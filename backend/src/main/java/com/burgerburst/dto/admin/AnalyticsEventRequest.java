package com.burgerburst.dto.admin;

import com.burgerburst.entity.AnalyticsEventType;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AnalyticsEventRequest(
        @NotNull UUID sessionId,
        @NotNull AnalyticsEventType eventType,
        UUID productId) {
}
