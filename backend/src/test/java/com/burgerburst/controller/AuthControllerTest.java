package com.burgerburst.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.burgerburst.auth.AuthService;
import com.burgerburst.dto.auth.AuthResponse;
import com.burgerburst.dto.auth.RefreshTokenRequest;
import com.burgerburst.dto.auth.TokenResponse;
import com.burgerburst.dto.auth.UserResponse;
import com.burgerburst.entity.Role;
import com.burgerburst.exception.GlobalExceptionHandler;
import com.burgerburst.security.UserPrincipal;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new AuthController(authService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void acceptsAValidEmailAndReturnsTheGenericResponse() throws Exception {
        mockMvc.perform(post("/api/v1/auth/send-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"Customer@Example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message")
                        .value("If the email address can receive messages, an OTP has been sent"))
                .andExpect(jsonPath("$.errors").isEmpty());

        verify(authService).sendOtp("Customer@Example.com");
    }

    @Test
    void rejectsAnInvalidEmailBeforeCallingTheService() throws Exception {
        mockMvc.perform(post("/api/v1/auth/send-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors[0].field").value("email"));

        verifyNoInteractions(authService);
    }

    @Test
    void verifiesOtpAndReturnsAuthenticationCredentials() throws Exception {
        UserResponse user = new UserResponse(
                UUID.randomUUID(),
                "customer@example.com",
                "Customer",
                null,
                Role.ROLE_CUSTOMER,
                true,
                true);
        AuthResponse authentication = new AuthResponse(
                "access-token", "refresh-token", 604_800L, "Bearer", user);
        when(authService.verifyOtp("Customer@Example.com", "123456")).thenReturn(authentication);

        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"Customer@Example.com\",\"otp\":\"123456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Authentication successful"))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"))
                .andExpect(jsonPath("$.data.expiresIn").value(604_800))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.email").value("customer@example.com"));

        verify(authService).verifyOtp("Customer@Example.com", "123456");
    }

    @Test
    void rejectsMalformedOtpBeforeAuthentication() throws Exception {
        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"customer@example.com\",\"otp\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors[0].field").value("otp"));

        verifyNoInteractions(authService);
    }

    @Test
    void rotatesRefreshTokenThroughTheRefreshEndpoint() throws Exception {
        TokenResponse tokens = new TokenResponse("new-access", "new-refresh", 604_800L, "Bearer");
        when(authService.refresh("old-refresh")).thenReturn(tokens);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"old-refresh\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("new-access"))
                .andExpect(jsonPath("$.data.refreshToken").value("new-refresh"))
                .andExpect(jsonPath("$.data.expiresIn").value(604_800))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"));

        verify(authService).refresh("old-refresh");
    }

    @Test
    void rejectsMissingRefreshToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].field").value("refreshToken"));

        verifyNoInteractions(authService);
    }

    @Test
    void delegatesLogoutAndLogoutAllForAuthenticatedUser() {
        UUID userUuid = UUID.randomUUID();
        UserPrincipal principal =
                new UserPrincipal(userUuid, "customer@example.com", Role.ROLE_CUSTOMER, true, true);
        AuthController controller = new AuthController(authService);

        controller.logout(principal, new RefreshTokenRequest("current-refresh"));
        controller.logoutAll(principal);

        verify(authService).logout(userUuid, "current-refresh");
        verify(authService).logoutAll(userUuid);
    }
}
