package com.burgerburst.auth;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.burgerburst.otp.OtpService;
import com.burgerburst.repository.UserRepository;
import com.burgerburst.security.JwtService;
import java.time.Clock;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthServiceSendOtpTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpService otpService;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private Clock clock;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, otpService, jwtService, refreshTokenService, clock);
    }

    @Test
    void delegatesOtpIssuanceToExistingOtpInfrastructure() {
        authService.sendOtp("Customer@Example.com");

        verify(otpService).issue("Customer@Example.com");
    }

    @Test
    void doesNotCheckRegistrationStatusBeforeSendingOtp() {
        authService.sendOtp("new-customer@example.com");

        verify(otpService).issue("new-customer@example.com");
        verify(userRepository, never()).existsByEmailIgnoreCaseAndDeletedAtIsNull("new-customer@example.com");
        verify(userRepository, never()).findByEmailIgnoreCaseAndDeletedAtIsNull("new-customer@example.com");
    }
}
