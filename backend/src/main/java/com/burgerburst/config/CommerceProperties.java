package com.burgerburst.config;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.commerce")
public record CommerceProperties(
        @DecimalMin("0.0001") BigDecimal rewardPointValue,
        @PositiveOrZero int rewardPointsPerCurrencyUnit,
        @DecimalMin("0.00") @DecimalMax("1.00") BigDecimal maximumRewardRedemptionRatio,
        @Positive int maximumCartItemQuantity) {
}
