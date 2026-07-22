package com.burgerburst.service;

import com.burgerburst.dto.admin.AdminCouponRequest;
import com.burgerburst.dto.admin.AdminCouponResponse;
import com.burgerburst.entity.Coupon;
import com.burgerburst.entity.DiscountType;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.CouponRepository;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminCouponService {

    private final CouponRepository couponRepository;
    private final JdbcTemplate jdbcTemplate;
    private final Clock clock;

    @Transactional(readOnly = true)
    public List<AdminCouponResponse> list() {
        return couponRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc().stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public AdminCouponResponse create(AdminCouponRequest request) {
        validate(request);
        if (couponRepository.existsByCodeIgnoreCaseAndDeletedAtIsNull(request.code())) {
            throw new BusinessRuleException("Coupon code already exists", HttpStatus.CONFLICT);
        }
        Coupon coupon = new Coupon();
        coupon.setUuid(UUID.randomUUID());
        coupon.setCode(request.code());
        apply(coupon, request, true);
        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public AdminCouponResponse update(UUID couponUuid, AdminCouponRequest request) {
        validate(request);
        Coupon coupon = find(couponUuid);
        if (!coupon.getCode().equalsIgnoreCase(request.code())) {
            throw new BusinessRuleException("Coupon codes cannot be renamed", HttpStatus.UNPROCESSABLE_ENTITY);
        }
        apply(coupon, request, false);
        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public AdminCouponResponse expire(UUID couponUuid) {
        Coupon coupon = find(couponUuid);
        coupon.setActive(false);
        Instant now = clock.instant();
        coupon.setExpiresAt(now.isAfter(coupon.getValidFrom())
                ? now : coupon.getValidFrom().plusSeconds(1));
        return toResponse(couponRepository.save(coupon));
    }

    private Coupon find(UUID uuid) {
        return couponRepository.findByUuidAndDeletedAtIsNull(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
    }

    private void validate(AdminCouponRequest request) {
        if (!request.validFrom().isBefore(request.expiresAt())) {
            throw new IllegalArgumentException("Coupon expiry must be after its valid-from time");
        }
        if (request.discountType() == DiscountType.PERCENTAGE
                && request.discountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Percentage discount cannot exceed 100");
        }
        if (request.maximumDiscount() != null
                && request.maximumDiscount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Maximum discount must be positive");
        }
    }

    private void apply(Coupon coupon, AdminCouponRequest request, boolean creating) {
        if (creating) coupon.setCode(request.code());
        coupon.setDescription(trimToNull(request.description()));
        coupon.setDiscountType(request.discountType());
        coupon.setDiscountValue(request.discountValue());
        coupon.setMaximumDiscount(request.maximumDiscount());
        coupon.setMinimumOrderAmount(request.minimumOrderAmount());
        coupon.setValidFrom(request.validFrom());
        coupon.setExpiresAt(request.expiresAt());
        coupon.setTotalUsageLimit(request.totalUsageLimit());
        coupon.setPerCustomerLimit(request.perCustomerLimit());
        coupon.setNewCustomersOnly(request.newCustomersOnly());
        coupon.setActive(request.active());
    }

    private AdminCouponResponse toResponse(Coupon coupon) {
        List<Usage> usages = jdbcTemplate.query("""
                select count(*) usage_count, coalesce(sum(discount_amount),0) discount_granted
                from coupon_redemptions where coupon_id = ? and deleted_at is null
                """, (rs, row) -> new Usage(rs.getLong("usage_count"), rs.getBigDecimal("discount_granted")),
                coupon.getId());
        Usage usage = usages.isEmpty() ? new Usage(0, BigDecimal.ZERO) : usages.getFirst();
        return new AdminCouponResponse(
                coupon.getUuid(), coupon.getCode(), coupon.getDescription(), coupon.getDiscountType(),
                coupon.getDiscountValue(), coupon.getMaximumDiscount(), coupon.getMinimumOrderAmount(),
                coupon.getValidFrom(), coupon.getExpiresAt(), coupon.getTotalUsageLimit(),
                coupon.getPerCustomerLimit(), coupon.isNewCustomersOnly(), coupon.isActive(),
                usage.count(), usage.discount(), coupon.getCreatedAt());
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }

    private record Usage(long count, BigDecimal discount) {
    }
}
