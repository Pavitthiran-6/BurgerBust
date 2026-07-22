package com.burgerburst.dto.order;

import com.burgerburst.entity.OrderStatus;
import com.burgerburst.entity.PaymentMethod;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String orderNumber,
        OrderStatus status,
        PaymentMethod paymentMethod,
        List<OrderItemResponse> items,
        BigDecimal subtotal,
        BigDecimal couponDiscount,
        BigDecimal rewardDiscount,
        BigDecimal tax,
        BigDecimal deliveryFee,
        BigDecimal total,
        String currency,
        String couponCode,
        int rewardPointsUsed,
        int rewardPointsEarned,
        OrderAddressResponse address,
        List<OrderStatusResponse> timeline,
        String cancellationReason,
        Instant placedAt,
        Instant createdAt) {
}

