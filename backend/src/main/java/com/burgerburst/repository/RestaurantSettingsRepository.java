package com.burgerburst.repository;

import com.burgerburst.entity.RestaurantSettings;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantSettingsRepository extends JpaRepository<RestaurantSettings, Long> {

    Optional<RestaurantSettings> findFirstByDeletedAtIsNullOrderByIdAsc();
}
