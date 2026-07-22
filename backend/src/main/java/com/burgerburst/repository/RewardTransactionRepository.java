package com.burgerburst.repository;

import com.burgerburst.entity.RewardTransaction;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, Long> {
    Page<RewardTransaction> findByRewardAccountUserUuidAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID userUuid, Pageable pageable);
}

