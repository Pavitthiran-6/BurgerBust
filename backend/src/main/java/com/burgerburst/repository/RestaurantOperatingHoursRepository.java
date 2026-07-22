package com.burgerburst.repository;

import com.burgerburst.entity.RestaurantOperatingHours;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantOperatingHoursRepository extends JpaRepository<RestaurantOperatingHours, Long> {
}
