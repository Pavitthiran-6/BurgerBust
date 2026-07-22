package com.burgerburst.dto.admin;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record BulkProductDeleteRequest(@NotEmpty @Size(max = 200) List<UUID> productIds) {
}
