package com.burgerburst.config;

import com.burgerburst.repository.RestaurantSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component("restaurant")
@RequiredArgsConstructor
public class RestaurantHealthIndicator implements HealthIndicator {

    private final RestaurantSettingsRepository repository;

    @Override
    public Health health() {
        return repository.findFirstByDeletedAtIsNullOrderByIdAsc()
                .map(settings -> Health.up()
                        .withDetail("configured", true)
                        .withDetail("orderingEnabled", settings.isOrderingEnabled())
                        .withDetail("maintenanceMode", settings.isMaintenanceMode())
                        .build())
                .orElseGet(() -> Health.outOfService().withDetail("configured", false).build());
    }
}
