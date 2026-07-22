package com.burgerburst.service;

import com.burgerburst.entity.Coupon;
import com.burgerburst.entity.DiscountType;
import com.burgerburst.entity.User;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.CouponRedemptionRepository;
import com.burgerburst.repository.CouponRepository;
import com.burgerburst.repository.OrderRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository redemptionRepository;
    private final Clock clock;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public Coupon findAndValidate(String code, User user, BigDecimal subtotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndDeletedAtIsNull(code.strip())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        validate(coupon, user, subtotal);
        return coupon;
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateDiscount(Coupon coupon, User user, BigDecimal subtotal) {
        if (coupon == null) return money(BigDecimal.ZERO);
        validate(coupon, user, subtotal);
        BigDecimal discount = coupon.getDiscountType() == DiscountType.PERCENTAGE
                ? subtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                : coupon.getDiscountValue();
        if (coupon.getMaximumDiscount() != null) discount = discount.min(coupon.getMaximumDiscount());
        return money(discount.min(subtotal));
    }

    private void validate(Coupon coupon, User user, BigDecimal subtotal) {
        Instant now = clock.instant();
        if (!coupon.isActive()) throw invalid("Coupon is disabled");
        if (now.isBefore(coupon.getValidFrom())) throw invalid("Coupon is not active yet");
        if (!now.isBefore(coupon.getExpiresAt())) throw invalid("Coupon has expired");
        if (subtotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw invalid("Coupon minimum order amount is " + coupon.getMinimumOrderAmount());
        }
        long totalUsage = redemptionRepository.countByCouponUuidAndDeletedAtIsNull(coupon.getUuid());
        if (coupon.getTotalUsageLimit() != null && totalUsage >= coupon.getTotalUsageLimit()) {
            throw invalid("Coupon usage limit has been reached");
        }
        long customerUsage = redemptionRepository
                .countByCouponUuidAndUserUuidAndDeletedAtIsNull(coupon.getUuid(), user.getUuid());
        if (customerUsage >= coupon.getPerCustomerLimit()) throw invalid("Coupon usage limit reached for this customer");
        if (coupon.isNewCustomersOnly() && orderRepository.existsByUserUuidAndDeletedAtIsNull(user.getUuid())) {
            throw invalid("Coupon is only available to new customers");
        }
    }

    private BusinessRuleException invalid(String message) {
        return new BusinessRuleException(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
