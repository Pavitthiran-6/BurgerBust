package com.burgerburst.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.dto.auth.AuthResponse;
import com.burgerburst.entity.Role;
import com.burgerburst.entity.User;
import com.burgerburst.otp.OtpService;
import com.burgerburst.repository.UserRepository;
import com.burgerburst.security.JwtService;
import com.burgerburst.security.UserPrincipal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthServiceVerifyOtpTest {

    private static final Instant NOW = Instant.parse("2026-07-21T12:00:00Z");

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpService otpService;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(NOW, ZoneOffset.UTC);
        authService = new AuthService(userRepository, otpService, jwtService, refreshTokenService, clock);
        when(jwtService.generateAccessToken(any(UserPrincipal.class))).thenReturn("access-token");
        when(jwtService.getAccessTokenExpirySeconds()).thenReturn(604_800L);
        when(refreshTokenService.issue(any(User.class)))
                .thenReturn(new IssuedRefreshToken("refresh-token", NOW.plusSeconds(2_592_000)));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createsVerifiedCustomerForValidOtpWhenUserDoesNotExist() {
        when(userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("new.customer@example.com"))
                .thenReturn(Optional.empty());

        AuthResponse response = authService.verifyOtp(" New.Customer@Example.com ", "123456");

        verify(otpService).verify("new.customer@example.com", "123456");
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User createdUser = userCaptor.getValue();
        assertThat(createdUser.getUuid()).isNotNull();
        assertThat(createdUser.getEmail()).isEqualTo("new.customer@example.com");
        assertThat(createdUser.getFullName()).isEqualTo("new customer");
        assertThat(createdUser.getRole()).isEqualTo(Role.ROLE_CUSTOMER);
        assertThat(createdUser.isVerified()).isTrue();
        assertThat(createdUser.isActive()).isTrue();
        assertThat(createdUser.getLastLoginAt()).isEqualTo(NOW);
        assertAuthenticationResponse(response);
    }

    @Test
    void verifiesAndUpdatesExistingUserLogin() {
        User existingUser = new User();
        UUID uuid = UUID.randomUUID();
        existingUser.setUuid(uuid);
        existingUser.setEmail("customer@example.com");
        existingUser.setFullName("Existing Customer");
        existingUser.setRole(Role.ROLE_CUSTOMER);
        existingUser.setActive(true);
        existingUser.setVerified(false);
        when(userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("customer@example.com"))
                .thenReturn(Optional.of(existingUser));

        AuthResponse response = authService.verifyOtp("CUSTOMER@example.com", "654321");

        verify(otpService).verify("customer@example.com", "654321");
        verify(userRepository).save(existingUser);
        verify(refreshTokenService).issue(existingUser);
        assertThat(existingUser.getUuid()).isEqualTo(uuid);
        assertThat(existingUser.isVerified()).isTrue();
        assertThat(existingUser.getLastLoginAt()).isEqualTo(NOW);
        assertAuthenticationResponse(response);
    }

    private void assertAuthenticationResponse(AuthResponse response) {
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        assertThat(response.expiresIn()).isEqualTo(604_800L);
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.user().verified()).isTrue();
    }
}
