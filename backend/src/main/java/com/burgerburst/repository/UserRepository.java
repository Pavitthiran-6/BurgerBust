package com.burgerburst.repository;

import com.burgerburst.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);

    Optional<User> findByUuidAndDeletedAtIsNull(UUID uuid);

    boolean existsByEmailIgnoreCaseAndDeletedAtIsNull(String email);
}
