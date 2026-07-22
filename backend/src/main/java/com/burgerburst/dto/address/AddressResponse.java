package com.burgerburst.dto.address;

import java.time.Instant;
import java.util.UUID;

public record AddressResponse(
        UUID id,
        String label,
        String tag,
        String recipientName,
        String phone,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String postalCode,
        String deliveryInstructions,
        boolean defaultAddress,
        Instant createdAt,
        Instant updatedAt) {
}
