package com.burgerburst.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.burgerburst.dto.user.CurrentUserResponse;
import com.burgerburst.entity.Role;
import com.burgerburst.entity.User;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.UserRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Test
    void returnsCurrentUserDetails() {
        UUID uuid = UUID.randomUUID();
        Instant createdAt = Instant.parse("2026-01-10T10:00:00Z");
        Instant lastLogin = Instant.parse("2026-07-21T12:00:00Z");
        User user = new User();
        user.setUuid(uuid);
        user.setEmail("customer@example.com");
        user.setFullName("Burger Customer");
        user.setRole(Role.ROLE_CUSTOMER);
        user.setVerified(true);
        user.setActive(true);
        user.setCreatedAt(createdAt);
        user.setLastLoginAt(lastLogin);
        when(userRepository.findByUuidAndDeletedAtIsNull(uuid)).thenReturn(Optional.of(user));

        CurrentUserResponse response = new UserService(userRepository).getCurrentUser(uuid);

        assertThat(response.uuid()).isEqualTo(uuid);
        assertThat(response.name()).isEqualTo("Burger Customer");
        assertThat(response.email()).isEqualTo("customer@example.com");
        assertThat(response.role()).isEqualTo(Role.ROLE_CUSTOMER);
        assertThat(response.verified()).isTrue();
        assertThat(response.active()).isTrue();
        assertThat(response.lastLogin()).isEqualTo(lastLogin);
        assertThat(response.createdAt()).isEqualTo(createdAt);
    }

    @Test
    void rejectsMissingCurrentUser() {
        UUID uuid = UUID.randomUUID();
        when(userRepository.findByUuidAndDeletedAtIsNull(uuid)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> new UserService(userRepository).getCurrentUser(uuid))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found");
    }
}
