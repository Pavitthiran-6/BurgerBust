package com.burgerburst.service;

import com.burgerburst.config.CommerceProperties;
import com.burgerburst.entity.Cart;
import com.burgerburst.entity.CartItem;
import com.burgerburst.entity.RestaurantSettings;
import java.math.BigDecimal;
import java.math.RoundingMode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartPricingService {

    private final CouponService couponService;
    private final CommerceProperties commerceProperties;

    public PricingResult calculate(Cart cart, RestaurantSettings settings, int rewardPoints) {
        BigDecimal subtotal = cart.getItems().stream()
                .map(item -> effectivePrice(item).multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        subtotal = money(subtotal);
        BigDecimal couponDiscount = couponService.calculateDiscount(cart.getCoupon(), cart.getUser(), subtotal);
        BigDecimal afterCoupon = subtotal.subtract(couponDiscount).max(BigDecimal.ZERO);
        BigDecimal requestedRewardValue = commerceProperties.rewardPointValue()
                .multiply(BigDecimal.valueOf(Math.max(rewardPoints, 0)));
        BigDecimal maximumRewardValue = afterCoupon.multiply(commerceProperties.maximumRewardRedemptionRatio());
        BigDecimal rewardDiscount = money(requestedRewardValue.min(maximumRewardValue).min(afterCoupon));
        BigDecimal taxable = afterCoupon.subtract(rewardDiscount).max(BigDecimal.ZERO);
        BigDecimal tax = money(taxable.multiply(settings.getTaxRate()));
        BigDecimal deliveryFee = cart.getItems().isEmpty() ? BigDecimal.ZERO : settings.getDeliveryFee();
        BigDecimal total = money(taxable.add(tax).add(deliveryFee));
        boolean minimumMet = subtotal.compareTo(settings.getMinimumOrderAmount()) >= 0;
        return new PricingResult(
                subtotal, couponDiscount, rewardDiscount, tax, money(deliveryFee), total,
                settings.getMinimumOrderAmount(), minimumMet, settings.getTaxRate(), settings.getCurrency());
    }

    public BigDecimal effectivePrice(CartItem item) {
        return item.getProduct().getOfferPrice() == null
                ? item.getProduct().getPrice()
                : item.getProduct().getOfferPrice();
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    public record PricingResult(
            BigDecimal subtotal,
            BigDecimal couponDiscount,
            BigDecimal rewardDiscount,
            BigDecimal tax,
            BigDecimal deliveryFee,
            BigDecimal total,
            BigDecimal minimumOrderAmount,
            boolean minimumOrderMet,
            BigDecimal taxRate,
            String currency) {
    }
}

