package com.burgerburst.auth;

import com.burgerburst.dto.auth.AuthResponse;
import com.burgerburst.dto.auth.TokenResponse;
import com.burgerburst.dto.auth.UserResponse;
import com.burgerburst.entity.Role;
import com.burgerburst.entity.User;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.otp.OtpService;
import com.burgerburst.repository.UserRepository;
import com.burgerburst.security.JwtService;
import com.burgerburst.security.UserPrincipal;
import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final Clock clock;

    public void sendOtp(String email) {
        otpService.issue(email);
    }

    @Transactional
    public AuthResponse verifyOtp(String email, String otp) {
        String normalizedEmail = normalizeEmail(email);
        otpService.verify(normalizedEmail, otp);

        Instant loginTime = clock.instant();
        User user = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(normalizedEmail)
                .orElseGet(() -> createCustomer(normalizedEmail));
        if (!user.isActive()) {
            throw new DisabledException("Account is inactive");
        }
        user.setVerified(true);
        user.setLastLoginAt(loginTime);
        User savedUser = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(UserPrincipal.from(savedUser));
        IssuedRefreshToken refreshToken = refreshTokenService.issue(savedUser);
        return new AuthResponse(
                accessToken,
                refreshToken.value(),
                jwtService.getAccessTokenExpirySeconds(),
                "Bearer",
                toResponse(savedUser));
    }

    public TokenResponse refresh(String rawRefreshToken) {
        RotatedRefreshToken rotation = refreshTokenService.rotate(rawRefreshToken);
        String accessToken = jwtService.generateAccessToken(UserPrincipal.from(rotation.user()));
        return new TokenResponse(
                accessToken,
                rotation.token().value(),
                jwtService.getAccessTokenExpirySeconds(),
                "Bearer");
    }

    public void logout(UUID authenticatedUserUuid, String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken, authenticatedUserUuid);
    }

    public void logoutAll(UUID authenticatedUserUuid) {
        refreshTokenService.revokeAll(authenticatedUserUuid);
    }

    @Transactional(readOnly = true)
    public UserResponse findActiveVerifiedUser(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull(normalizedEmail)
                .filter(User::isActive)
                .filter(User::isVerified)
                .orElseThrow(() -> new ResourceNotFoundException("Active verified user not found"));
        return toResponse(user);
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getUuid(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole(),
                user.isVerified(),
                user.isActive());
    }

    private User createCustomer(String normalizedEmail) {
        User user = new User();
        user.setUuid(UUID.randomUUID());
        user.setEmail(normalizedEmail);
        user.setFullName(defaultFullName(normalizedEmail));
        user.setRole(Role.ROLE_CUSTOMER);
        user.setVerified(true);
        user.setActive(true);
        return user;
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        return email.strip().toLowerCase(Locale.ROOT);
    }

    private String defaultFullName(String email) {
        String localPart = email.substring(0, email.indexOf('@'));
        String readableName = localPart.replaceAll("[._-]+", " ").strip();
        return readableName.isEmpty() ? "Customer" : readableName;
    }
}
