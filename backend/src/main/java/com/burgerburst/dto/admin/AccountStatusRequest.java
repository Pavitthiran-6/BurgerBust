package com.burgerburst.dto.admin;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AccountStatusRequest(
        @NotNull Boolean active,
        @Size(max = 500) String reason) {
}
