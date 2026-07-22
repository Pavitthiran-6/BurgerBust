package com.burgerburst.repository;

import com.burgerburst.entity.Notification;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @EntityGraph(attributePaths = {"order"})
    Page<Notification> findByUserUuidAndDeletedAtIsNullOrderByCreatedAtDesc(UUID userUuid, Pageable pageable);
    @EntityGraph(attributePaths = {"user", "order"})
    Optional<Notification> findByUuidAndUserUuidAndDeletedAtIsNull(UUID uuid, UUID userUuid);
    long countByUserUuidAndReadAtIsNullAndDeletedAtIsNull(UUID userUuid);
}

