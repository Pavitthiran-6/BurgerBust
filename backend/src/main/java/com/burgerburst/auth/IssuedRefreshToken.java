package com.burgerburst.auth;

import java.time.Instant;

public record IssuedRefreshToken(String value, Instant expiresAt) {
}
