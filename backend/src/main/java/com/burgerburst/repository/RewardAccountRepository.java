package com.burgerburst.repository;

import com.burgerburst.entity.RewardAccount;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface RewardAccountRepository extends JpaRepository<RewardAccount, Long> {
    Optional<RewardAccount> findByUserUuidAndDeletedAtIsNull(UUID userUuid);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RewardAccount> findForUpdateByUserUuidAndDeletedAtIsNull(UUID userUuid);
}

