package com.burgerburst.repository;

import com.burgerburst.entity.RefreshToken;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHashAndDeletedAtIsNull(String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = "user")
    @Query("""
            select token from RefreshToken token
            where token.tokenHash = :tokenHash
              and token.deletedAt is null
            """)
    Optional<RefreshToken> findForUpdateByTokenHash(@Param("tokenHash") String tokenHash);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update RefreshToken token
               set token.revokedAt = :revokedAt,
                   token.updatedAt = :revokedAt
             where token.user.uuid = :userUuid
               and token.revokedAt is null
               and token.deletedAt is null
            """)
    int revokeAllActiveByUserUuid(
            @Param("userUuid") UUID userUuid,
            @Param("revokedAt") Instant revokedAt);
}
