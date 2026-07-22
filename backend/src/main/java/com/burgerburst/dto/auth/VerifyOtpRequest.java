package com.burgerburst.dto.auth;

import com.burgerburst.validation.ValidOtp;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyOtpRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(max = 320, message = "Email is too long")
        String email,
        @ValidOtp String otp) {
}
