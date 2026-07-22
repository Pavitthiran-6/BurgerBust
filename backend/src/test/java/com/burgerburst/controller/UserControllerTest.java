package com.burgerburst.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.auth.UserService;
import com.burgerburst.dto.user.CurrentUserResponse;
import com.burgerburst.entity.Role;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.security.UserPrincipal;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Test
    void returnsTheAuthenticatedUsersCurrentDetails() {
        UUID uuid = UUID.randomUUID();
        UserPrincipal principal =
                new UserPrincipal(uuid, "customer@example.com", Role.ROLE_CUSTOMER, true, true);
        CurrentUserResponse currentUser = new CurrentUserResponse(
                uuid,
                "Customer",
                "customer@example.com",
                Role.ROLE_CUSTOMER,
                true,
                true,
                Instant.parse("2026-07-21T12:00:00Z"),
                Instant.parse("2026-01-01T00:00:00Z"));
        when(userService.getCurrentUser(uuid)).thenReturn(currentUser);

        ResponseEntity<ApiResponse<CurrentUserResponse>> response =
                new UserController(userService).me(principal);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().data()).isEqualTo(currentUser);
        verify(userService).getCurrentUser(uuid);
    }
}
