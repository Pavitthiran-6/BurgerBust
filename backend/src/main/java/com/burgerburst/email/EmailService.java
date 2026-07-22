package com.burgerburst.email;

import java.time.Instant;

public interface EmailService {

    void sendOtp(String recipientEmail, String otp, Instant expiresAt);
}
