package com.burgerburst.dto.cart;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartResponse(
        UUID cartId,
        List<CartItemResponse> items,
        int itemCount,
        int totalQuantity,
        String couponCode,
        BigDecimal subtotal,
        BigDecimal couponDiscount,
        BigDecimal taxRate,
        BigDecimal tax,
        BigDecimal deliveryFee,
        BigDecimal total,
        BigDecimal minimumOrderAmount,
        boolean minimumOrderMet,
        boolean valid,
        String currency) {
}

