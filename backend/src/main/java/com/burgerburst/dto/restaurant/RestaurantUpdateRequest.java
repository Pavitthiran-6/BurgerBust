package com.burgerburst.dto.restaurant;

import com.burgerburst.entity.RestaurantStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record RestaurantUpdateRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 200) String tagline,
        @Email @Size(max = 320) String email,
        @Size(max = 20) String contactNumber,
        @NotBlank @Size(max = 50) String timeZone,
        @NotBlank @Pattern(regexp = "[A-Z]{3}") String currency,
        @NotNull @DecimalMin("0.00") BigDecimal minimumOrderAmount,
        @NotNull @DecimalMin("0.00") BigDecimal deliveryRadiusKm,
        @NotNull @DecimalMin("0.00") BigDecimal deliveryFee,
        @NotNull @DecimalMin("0.00") @jakarta.validation.constraints.DecimalMax("1.00") BigDecimal taxRate,
        @Positive int estimatedDeliveryMinutes,
        @NotNull RestaurantStatus status,
        boolean orderingEnabled,
        boolean serviceAvailable,
        boolean maintenanceMode,
        @Size(max = 500) String maintenanceMessage,
        @Size(max = 1000) String bannerUrl,
        @Size(max = 1000) String logoUrl,
        @Size(max = 200) String addressLine1,
        @Size(max = 200) String addressLine2,
        @Size(max = 100) String city,
        @Size(max = 100) String state,
        @Size(max = 20) String postalCode,
        @Size(max = 100) String country,
        @Size(max = 1000) String facebookUrl,
        @Size(max = 1000) String instagramUrl,
        @Size(max = 1000) String xUrl,
        @Size(max = 30) String gstNumber,
        @Size(max = 30) String fssaiNumber,
        @NotEmpty @Size(min = 7, max = 7) List<@Valid OperatingHoursRequest> operatingHours) {
}
