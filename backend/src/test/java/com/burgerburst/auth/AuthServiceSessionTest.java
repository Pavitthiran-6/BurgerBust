package com.burgerburst.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.dto.auth.TokenResponse;
import com.burgerburst.entity.Role;
import com.burgerburst.entity.User;
import com.burgerburst.otp.OtpService;
import com.burgerburst.repository.UserRepository;
import com.burgerburst.security.JwtService;
import com.burgerburst.security.UserPrincipal;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthServiceSessionTest {

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
        authService = new AuthService(
                userRepository, otpService, jwtService, refreshTokenService, Clock.systemUTC());
    }

    @Test
    void returnsNewTokenPairAfterRefreshRotation() {
        User user = activeUser();
        IssuedRefreshToken refreshToken =
                new IssuedRefreshToken("new-refresh", Instant.now().plusSeconds(3600));
        when(refreshTokenService.rotate("old-refresh"))
                .thenReturn(new RotatedRefreshToken(user, refreshToken));
        when(jwtService.generateAccessToken(org.mockito.ArgumentMatchers.any(UserPrincipal.class)))
                .thenReturn("new-access");
        when(jwtService.getAccessTokenExpirySeconds()).thenReturn(604_800L);

        TokenResponse response = authService.refresh("old-refresh");

        assertThat(response.accessToken()).isEqualTo("new-access");
        assertThat(response.refreshToken()).isEqualTo("new-refresh");
        assertThat(response.expiresIn()).isEqualTo(604_800L);
        assertThat(response.tokenType()).isEqualTo("Bearer");
        ArgumentCaptor<UserPrincipal> principalCaptor = ArgumentCaptor.forClass(UserPrincipal.class);
        verify(jwtService).generateAccessToken(principalCaptor.capture());
        assertThat(principalCaptor.getValue().uuid()).isEqualTo(user.getUuid());
    }

    @Test
    void logsOutTheCurrentSession() {
        UUID userUuid = UUID.randomUUID();

        authService.logout(userUuid, "current-refresh");

        verify(refreshTokenService).revoke("current-refresh", userUuid);
    }

    @Test
    void logsOutAllUserSessions() {
        UUID userUuid = UUID.randomUUID();

        authService.logoutAll(userUuid);

        verify(refreshTokenService).revokeAll(userUuid);
    }

    private User activeUser() {
        User user = new User();
        user.setUuid(UUID.randomUUID());
        user.setEmail("customer@example.com");
        user.setFullName("Customer");
        user.setRole(Role.ROLE_CUSTOMER);
        user.setVerified(true);
        user.setActive(true);
        return user;
    }
}
