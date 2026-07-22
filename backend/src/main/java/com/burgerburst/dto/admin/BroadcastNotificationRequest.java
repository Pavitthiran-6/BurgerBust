package com.burgerburst.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BroadcastNotificationRequest(
        @NotNull Category category,
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 1000) String message) {

    public enum Category {
        ANNOUNCEMENT,
        OFFERS,
        MAINTENANCE
    }
}
