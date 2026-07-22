package com.burgerburst.controller;

import com.burgerburst.auth.AuthService;
import com.burgerburst.dto.auth.AuthResponse;
import com.burgerburst.dto.auth.RefreshTokenRequest;
import com.burgerburst.dto.auth.SendOtpRequest;
import com.burgerburst.dto.auth.TokenResponse;
import com.burgerburst.dto.auth.VerifyOtpRequest;
import com.burgerburst.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.burgerburst.security.UserPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String OTP_ACCEPTED_MESSAGE =
            "If the email address can receive messages, an OTP has been sent";

    private final AuthService authService;

    @PostMapping("/send-otp")
    @Operation(
            summary = "Send a one-time password",
            description = "Generates and sends an OTP without revealing account registration status.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "OTP request accepted",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid request",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "OTP request could not be processed",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendOtp(request.email());
        return ResponseEntity.ok(ApiResponse.success(OTP_ACCEPTED_MESSAGE, null));
    }

    @PostMapping("/verify-otp")
    @Operation(
            summary = "Verify a one-time password",
            description = "Verifies and consumes an OTP, then returns access and refresh credentials.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "OTP verified and authentication completed",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "OTP is invalid, expired, consumed, or the request is invalid",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Account is inactive",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse authentication = authService.verifyOtp(request.email(), request.otp());
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", authentication));
    }

    @PostMapping("/refresh")
    @Operation(
            summary = "Rotate a refresh token",
            description = "Revokes the supplied refresh token and returns a new access/refresh token pair.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Token pair rotated",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Refresh token is invalid, expired, revoked, or belongs to an inactive user")
    })
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse tokens = authService.refresh(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success("Tokens refreshed", tokens));
    }

    @PostMapping("/logout")
    @Operation(
            summary = "Log out the current session",
            description = "Revokes the supplied refresh token. The access token remains valid until expiry.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Current session logged out"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Authentication or refresh token is invalid")
    })
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(principal.uuid(), request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }

    @PostMapping("/logout-all")
    @Operation(
            summary = "Log out all sessions",
            description = "Revokes every refresh token for the current user. Existing access tokens remain valid until expiry.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "All sessions logged out"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required")
    })
    public ResponseEntity<ApiResponse<Void>> logoutAll(
            @AuthenticationPrincipal UserPrincipal principal) {
        authService.logoutAll(principal.uuid());
        return ResponseEntity.ok(ApiResponse.success("All sessions logged out", null));
    }
}
