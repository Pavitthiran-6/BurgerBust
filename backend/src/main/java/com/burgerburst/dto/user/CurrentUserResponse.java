package com.burgerburst.dto.user;

import com.burgerburst.entity.Role;
import java.time.Instant;
import java.util.UUID;

public record CurrentUserResponse(
        UUID uuid,
        String name,
        String email,
        Role role,
        boolean verified,
        boolean active,
        Instant lastLogin,
        Instant createdAt) {
}
