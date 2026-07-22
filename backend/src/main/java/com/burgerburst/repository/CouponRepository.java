package com.burgerburst.repository;

import com.burgerburst.entity.Coupon;
import java.util.Optional;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeIgnoreCaseAndDeletedAtIsNull(String code);
    Optional<Coupon> findByUuidAndDeletedAtIsNull(UUID uuid);
    List<Coupon> findAllByDeletedAtIsNullOrderByCreatedAtDesc();
    boolean existsByCodeIgnoreCaseAndDeletedAtIsNull(String code);
}
