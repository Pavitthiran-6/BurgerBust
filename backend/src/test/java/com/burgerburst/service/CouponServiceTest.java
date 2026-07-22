package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.burgerburst.entity.Coupon;
import com.burgerburst.entity.DiscountType;
import com.burgerburst.entity.User;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.repository.CouponRedemptionRepository;
import com.burgerburst.repository.CouponRepository;
import com.burgerburst.repository.OrderRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    private static final Instant NOW = Instant.parse("2026-07-21T12:00:00Z");

    @Mock private CouponRepository couponRepository;
    @Mock private CouponRedemptionRepository redemptionRepository;
    @Mock private OrderRepository orderRepository;

    private CouponService service;
    private Coupon coupon;
    private User user;

    @BeforeEach
    void setUp() {
        service = new CouponService(couponRepository, redemptionRepository,
                Clock.fixed(NOW, ZoneOffset.UTC), orderRepository);
        coupon = new Coupon();
        coupon.setUuid(UUID.randomUUID());
        coupon.setCode("SAVE20");
        coupon.setActive(true);
        coupon.setDiscountType(DiscountType.PERCENTAGE);
        coupon.setDiscountValue(new BigDecimal("20"));
        coupon.setMaximumDiscount(new BigDecimal("10"));
        coupon.setMinimumOrderAmount(new BigDecimal("15"));
        coupon.setValidFrom(NOW.minusSeconds(60));
        coupon.setExpiresAt(NOW.plusSeconds(60));
        coupon.setPerCustomerLimit(1);
        user = new User();
        user.setUuid(UUID.randomUUID());
    }

    @Test
    void calculatesPercentageDiscountWithMaximumCap() {
        when(couponRepository.findByCodeIgnoreCaseAndDeletedAtIsNull("SAVE20")).thenReturn(Optional.of(coupon));

        Coupon valid = service.findAndValidate("SAVE20", user, new BigDecimal("100"));

        assertThat(service.calculateDiscount(valid, user, new BigDecimal("100"))).isEqualByComparingTo("10.00");
    }

    @Test
    void rejectsExpiredCoupon() {
        coupon.setExpiresAt(NOW);
        when(couponRepository.findByCodeIgnoreCaseAndDeletedAtIsNull("SAVE20")).thenReturn(Optional.of(coupon));

        assertThatThrownBy(() -> service.findAndValidate("SAVE20", user, new BigDecimal("20")))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("expired");
    }

    @Test
    void rejectsOrderBelowMinimum() {
        when(couponRepository.findByCodeIgnoreCaseAndDeletedAtIsNull("SAVE20")).thenReturn(Optional.of(coupon));

        assertThatThrownBy(() -> service.findAndValidate("SAVE20", user, new BigDecimal("10")))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("minimum");
    }

    @Test
    void rejectsPerCustomerUsageLimit() {
        when(couponRepository.findByCodeIgnoreCaseAndDeletedAtIsNull("SAVE20")).thenReturn(Optional.of(coupon));
        when(redemptionRepository.countByCouponUuidAndUserUuidAndDeletedAtIsNull(coupon.getUuid(), user.getUuid()))
                .thenReturn(1L);

        assertThatThrownBy(() -> service.findAndValidate("SAVE20", user, new BigDecimal("20")))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("customer");
    }

    @Test
    void rejectsNewCustomerCouponWhenPriorOrderExists() {
        coupon.setNewCustomersOnly(true);
        when(couponRepository.findByCodeIgnoreCaseAndDeletedAtIsNull("SAVE20")).thenReturn(Optional.of(coupon));
        when(orderRepository.existsByUserUuidAndDeletedAtIsNull(user.getUuid())).thenReturn(true);

        assertThatThrownBy(() -> service.findAndValidate("SAVE20", user, new BigDecimal("20")))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("new customers");
    }
}

