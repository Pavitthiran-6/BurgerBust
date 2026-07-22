package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.dto.admin.AdminCouponRequest;
import com.burgerburst.entity.Coupon;
import com.burgerburst.entity.DiscountType;
import com.burgerburst.repository.CouponRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

@ExtendWith(MockitoExtension.class)
class AdminCouponServiceTest {

    @Mock private CouponRepository couponRepository;
    @Mock private JdbcTemplate jdbcTemplate;
    private AdminCouponService service;

    @BeforeEach
    void setUp() {
        service = new AdminCouponService(couponRepository, jdbcTemplate,
                Clock.fixed(Instant.parse("2026-07-21T10:00:00Z"), ZoneOffset.UTC));
    }

    @Test
    void rejectsPercentageAboveOneHundred() {
        AdminCouponRequest request = request(DiscountType.PERCENTAGE, "100.01",
                Instant.parse("2026-07-22T00:00:00Z"));

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot exceed 100");
        verify(couponRepository, never()).save(org.mockito.ArgumentMatchers.any(Coupon.class));
    }

    @Test
    void rejectsExpiryBeforeStart() {
        AdminCouponRequest request = request(DiscountType.FIXED, "10",
                Instant.parse("2026-07-20T00:00:00Z"));

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("expiry must be after");
    }

    @Test
    void rejectsDuplicateCouponCode() {
        when(couponRepository.existsByCodeIgnoreCaseAndDeletedAtIsNull("WELCOME"))
                .thenReturn(true);

        assertThatThrownBy(() -> service.create(request(
                DiscountType.FIXED, "10", Instant.parse("2026-08-01T00:00:00Z"))))
                .hasMessageContaining("already exists");
    }

    private AdminCouponRequest request(DiscountType type, String value, Instant expiry) {
        return new AdminCouponRequest("WELCOME", "Welcome offer", type, new BigDecimal(value),
                null, BigDecimal.ZERO, Instant.parse("2026-07-21T00:00:00Z"), expiry,
                100, 1, true, true);
    }
}
