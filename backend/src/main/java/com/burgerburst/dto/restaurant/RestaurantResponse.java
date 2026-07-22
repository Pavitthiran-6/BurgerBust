package com.burgerburst.dto.restaurant;

import com.burgerburst.entity.RestaurantStatus;
import java.math.BigDecimal;
import java.util.List;

public record RestaurantResponse(
        String name,
        String tagline,
        RestaurantStatus status,
        boolean canAcceptOrders,
        boolean orderingEnabled,
        boolean serviceAvailable,
        boolean maintenanceMode,
        String maintenanceMessage,
        BigDecimal minimumOrderAmount,
        BigDecimal deliveryRadiusKm,
        BigDecimal deliveryFee,
        BigDecimal taxRate,
        int estimatedDeliveryMinutes,
        String currency,
        String timeZone,
        String bannerUrl,
        String logoUrl,
        String contactNumber,
        String email,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String postalCode,
        String country,
        String facebookUrl,
        String instagramUrl,
        String xUrl,
        String gstNumber,
        String fssaiNumber,
        List<OperatingHoursResponse> operatingHours) {
}
