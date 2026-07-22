package com.burgerburst.dto.restaurant;

import com.burgerburst.entity.RestaurantStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RestaurantStatusUpdateRequest(
        @NotNull RestaurantStatus status,
        Boolean serviceAvailable,
        Boolean maintenanceMode,
        @Size(max = 500) String maintenanceMessage) {
}
