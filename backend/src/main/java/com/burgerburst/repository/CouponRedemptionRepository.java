package com.burgerburst.repository;

import com.burgerburst.entity.CouponRedemption;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, Long> {
    long countByCouponUuidAndDeletedAtIsNull(UUID couponUuid);
    long countByCouponUuidAndUserUuidAndDeletedAtIsNull(UUID couponUuid, UUID userUuid);
    long countByUserUuidAndDeletedAtIsNull(UUID userUuid);
    Optional<CouponRedemption> findByOrderUuidAndDeletedAtIsNull(UUID orderUuid);
}

