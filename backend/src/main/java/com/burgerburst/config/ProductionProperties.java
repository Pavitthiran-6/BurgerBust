package com.burgerburst.config;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.production")
public record ProductionProperties(
        boolean rateLimitEnabled,
        @Positive int generalRequests,
        @Positive int authenticationRequests,
        @Positive int otpRequests,
        @Positive int analyticsRequests,
        @NotNull Duration generalWindow,
        @NotNull Duration authenticationWindow,
        @NotNull Duration otpWindow) {
}
