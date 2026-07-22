package com.burgerburst.otp;

import java.time.Instant;

public record OtpChallenge(String email, Instant expiresAt) {
}
