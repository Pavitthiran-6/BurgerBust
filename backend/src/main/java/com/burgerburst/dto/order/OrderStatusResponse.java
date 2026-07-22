package com.burgerburst.dto.order;

import com.burgerburst.entity.OrderStatus;
import java.time.Instant;
import java.util.UUID;

public record OrderStatusResponse(UUID id, OrderStatus status, String note, Instant occurredAt) {
}

