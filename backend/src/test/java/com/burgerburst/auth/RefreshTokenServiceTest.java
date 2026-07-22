package com.burgerburst.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.entity.RefreshToken;
import com.burgerburst.entity.Role;
import com.burgerburst.entity.User;
import com.burgerburst.exception.InvalidRefreshTokenException;
import com.burgerburst.repository.RefreshTokenRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    private static final Instant NOW = Instant.parse("2026-07-21T12:00:00Z");

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Test
    void persistsOnlyTheRefreshTokenHash() {
        RefreshTokenService service = service();
        User user = new User();
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        IssuedRefreshToken issuedToken = service.issue(user);

        ArgumentCaptor<RefreshToken> tokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(tokenCaptor.capture());
        RefreshToken persistedToken = tokenCaptor.getValue();
        assertThat(issuedToken.value()).isNotBlank();
        assertThat(persistedToken.getTokenHash())
                .isNotEqualTo(issuedToken.value())
                .isEqualTo(service.hash(issuedToken.value()));
        assertThat(persistedToken.getUser()).isSameAs(user);
        assertThat(persistedToken.getExpiresAt()).isEqualTo(NOW.plus(RefreshTokenService.REFRESH_TOKEN_EXPIRY));
        assertThat(issuedToken.expiresAt()).isEqualTo(persistedToken.getExpiresAt());
    }

    @Test
    void rotatesAValidRefreshTokenAndRevokesTheOldToken() {
        RefreshTokenService service = service();
        User user = activeUser();
        RefreshToken oldToken = token(user, NOW.plusSeconds(3600), null);
        when(refreshTokenRepository.findForUpdateByTokenHash(service.hash("old-token")))
                .thenReturn(Optional.of(oldToken));
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RotatedRefreshToken rotation = service.rotate("old-token");

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository, times(2)).save(captor.capture());
        List<RefreshToken> savedTokens = captor.getAllValues();
        assertThat(oldToken.getRevokedAt()).isEqualTo(NOW);
        assertThat(rotation.user()).isSameAs(user);
        assertThat(rotation.token().value()).isNotEqualTo("old-token");
        assertThat(savedTokens.get(1).getTokenHash()).isEqualTo(service.hash(rotation.token().value()));
    }

    @Test
    void rejectsAnExpiredRefreshToken() {
        RefreshTokenService service = service();
        RefreshToken expiredToken = token(activeUser(), NOW.minusSeconds(1), null);
        when(refreshTokenRepository.findForUpdateByTokenHash(service.hash("expired-token")))
                .thenReturn(Optional.of(expiredToken));

        assertThatThrownBy(() -> service.rotate("expired-token"))
                .isInstanceOf(InvalidRefreshTokenException.class);
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void rejectsARevokedRefreshToken() {
        RefreshTokenService service = service();
        RefreshToken revokedToken = token(activeUser(), NOW.plusSeconds(3600), NOW.minusSeconds(10));
        when(refreshTokenRepository.findForUpdateByTokenHash(service.hash("revoked-token")))
                .thenReturn(Optional.of(revokedToken));

        assertThatThrownBy(() -> service.rotate("revoked-token"))
                .isInstanceOf(InvalidRefreshTokenException.class);
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void rejectsRefreshForAnInactiveUser() {
        RefreshTokenService service = service();
        User user = activeUser();
        user.setActive(false);
        RefreshToken token = token(user, NOW.plusSeconds(3600), null);
        when(refreshTokenRepository.findForUpdateByTokenHash(service.hash("inactive-token")))
                .thenReturn(Optional.of(token));

        assertThatThrownBy(() -> service.rotate("inactive-token"))
                .isInstanceOf(InvalidRefreshTokenException.class);
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void revokesTheAuthenticatedUsersCurrentRefreshToken() {
        RefreshTokenService service = service();
        User user = activeUser();
        RefreshToken token = token(user, NOW.plusSeconds(3600), null);
        when(refreshTokenRepository.findForUpdateByTokenHash(service.hash("logout-token")))
                .thenReturn(Optional.of(token));

        service.revoke("logout-token", user.getUuid());

        assertThat(token.getRevokedAt()).isEqualTo(NOW);
        verify(refreshTokenRepository).save(token);
    }

    @Test
    void rejectsLogoutWithAnotherUsersRefreshToken() {
        RefreshTokenService service = service();
        User owner = activeUser();
        RefreshToken token = token(owner, NOW.plusSeconds(3600), null);
        when(refreshTokenRepository.findForUpdateByTokenHash(service.hash("other-token")))
                .thenReturn(Optional.of(token));

        assertThatThrownBy(() -> service.revoke("other-token", UUID.randomUUID()))
                .isInstanceOf(InvalidRefreshTokenException.class);
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void revokesAllRefreshTokensForTheAuthenticatedUser() {
        RefreshTokenService service = service();
        UUID userUuid = UUID.randomUUID();
        when(refreshTokenRepository.revokeAllActiveByUserUuid(userUuid, NOW)).thenReturn(3);

        int revoked = service.revokeAll(userUuid);

        assertThat(revoked).isEqualTo(3);
        verify(refreshTokenRepository).revokeAllActiveByUserUuid(userUuid, NOW);
    }

    private RefreshTokenService service() {
        return new RefreshTokenService(refreshTokenRepository, Clock.fixed(NOW, ZoneOffset.UTC));
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

    private RefreshToken token(User user, Instant expiresAt, Instant revokedAt) {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash("stored-hash");
        token.setExpiresAt(expiresAt);
        token.setRevokedAt(revokedAt);
        return token;
    }
}
