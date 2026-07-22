package com.burgerburst.auth;

import com.burgerburst.entity.RefreshToken;
import com.burgerburst.entity.User;
import com.burgerburst.exception.InvalidRefreshTokenException;
import com.burgerburst.repository.RefreshTokenRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    static final Duration REFRESH_TOKEN_EXPIRY = Duration.ofDays(30);
    private static final int TOKEN_BYTES = 64;

    private final RefreshTokenRepository refreshTokenRepository;
    private final Clock clock;
    private final SecureRandom secureRandom = new SecureRandom();

    public IssuedRefreshToken issue(User user) {
        byte[] tokenBytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(tokenBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        Instant expiresAt = clock.instant().plus(REFRESH_TOKEN_EXPIRY);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hash(rawToken));
        refreshToken.setExpiresAt(expiresAt);
        refreshTokenRepository.save(refreshToken);

        return new IssuedRefreshToken(rawToken, expiresAt);
    }

    @Transactional
    public RotatedRefreshToken rotate(String rawToken) {
        RefreshToken currentToken = findForUpdate(rawToken);
        Instant now = clock.instant();
        User user = currentToken.getUser();
        if (!currentToken.isUsableAt(now)
                || !user.isActive()
                || !user.isVerified()
                || user.isDeleted()) {
            throw new InvalidRefreshTokenException();
        }

        currentToken.setRevokedAt(now);
        refreshTokenRepository.save(currentToken);
        return new RotatedRefreshToken(user, issue(user));
    }

    @Transactional
    public void revoke(String rawToken, UUID authenticatedUserUuid) {
        RefreshToken refreshToken = findForUpdate(rawToken);
        if (!refreshToken.getUser().getUuid().equals(authenticatedUserUuid)) {
            throw new InvalidRefreshTokenException();
        }
        if (refreshToken.getRevokedAt() == null) {
            refreshToken.setRevokedAt(clock.instant());
            refreshTokenRepository.save(refreshToken);
        }
    }

    @Transactional
    public int revokeAll(UUID authenticatedUserUuid) {
        return refreshTokenRepository.revokeAllActiveByUserUuid(authenticatedUserUuid, clock.instant());
    }

    private RefreshToken findForUpdate(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidRefreshTokenException();
        }
        return refreshTokenRepository.findForUpdateByTokenHash(hash(rawToken))
                .orElseThrow(InvalidRefreshTokenException::new);
    }

    String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return java.util.HexFormat.of().formatHex(
                    digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
