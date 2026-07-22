package com.burgerburst.dto.admin;

import com.burgerburst.dto.order.OrderResponse;
import java.util.UUID;

public record AdminOrderResponse(
        OrderResponse order,
        UUID customerId,
        String customerName,
        String customerEmail) {
}
