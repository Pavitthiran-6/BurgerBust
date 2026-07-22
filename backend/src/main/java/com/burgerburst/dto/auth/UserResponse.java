package com.burgerburst.dto.auth;

import com.burgerburst.entity.Role;
import java.util.UUID;

public record UserResponse(
        UUID uuid,
        String email,
        String fullName,
        String phone,
        Role role,
        boolean verified,
        boolean active) {
}
