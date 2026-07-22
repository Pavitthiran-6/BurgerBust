package com.burgerburst.dto.order;

public record OrderAddressResponse(
        String recipientName,
        String phone,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String postalCode,
        String deliveryInstructions) {
}

