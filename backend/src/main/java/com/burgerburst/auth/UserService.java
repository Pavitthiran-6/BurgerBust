package com.burgerburst.auth;

import com.burgerburst.dto.user.CurrentUserResponse;
import com.burgerburst.entity.User;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(UUID userUuid) {
        User user = userRepository.findByUuidAndDeletedAtIsNull(userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new CurrentUserResponse(
                user.getUuid(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isVerified(),
                user.isActive(),
                user.getLastLoginAt(),
                user.getCreatedAt());
    }
}
