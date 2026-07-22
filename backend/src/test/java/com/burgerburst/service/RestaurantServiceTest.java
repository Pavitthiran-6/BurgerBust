package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.dto.restaurant.RestaurantResponse;
import com.burgerburst.dto.restaurant.RestaurantStatusUpdateRequest;
import com.burgerburst.entity.RestaurantOperatingHours;
import com.burgerburst.entity.RestaurantSettings;
import com.burgerburst.entity.RestaurantStatus;
import com.burgerburst.repository.RestaurantSettingsRepository;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RestaurantServiceTest {

    @Mock
    private RestaurantSettingsRepository repository;

    private RestaurantService service;
    private RestaurantSettings settings;

    @BeforeEach
    void setUp() {
        service = new RestaurantService(repository);
        settings = new RestaurantSettings();
        settings.setRestaurantName("BurgerBurst HQ");
        settings.setStatus(RestaurantStatus.OPEN);
        settings.setOrderingEnabled(true);
        settings.setServiceAvailable(true);
        settings.setMinimumOrderAmount(BigDecimal.valueOf(5));
        settings.setDeliveryRadiusKm(BigDecimal.TEN);
        settings.setDeliveryFee(BigDecimal.valueOf(3.99));
        settings.setEstimatedDeliveryMinutes(30);
        settings.setCurrency("USD");
        settings.setTimeZone("Asia/Kolkata");
        RestaurantOperatingHours monday = new RestaurantOperatingHours();
        monday.setDayOfWeek(DayOfWeek.MONDAY);
        monday.setOpenTime(LocalTime.of(8, 0));
        monday.setCloseTime(LocalTime.of(23, 0));
        monday.setRestaurantSettings(settings);
        settings.getOperatingHours().add(monday);
        when(repository.findFirstByDeletedAtIsNullOrderByIdAsc()).thenReturn(Optional.of(settings));
    }

    @Test
    void returnsPublicRestaurantAvailabilityAndHours() {
        RestaurantResponse response = service.getRestaurant();

        assertThat(response.name()).isEqualTo("BurgerBurst HQ");
        assertThat(response.status()).isEqualTo(RestaurantStatus.OPEN);
        assertThat(response.canAcceptOrders()).isTrue();
        assertThat(response.operatingHours()).hasSize(1);
    }

    @Test
    void maintenanceModePreventsOrders() {
        when(repository.save(any(RestaurantSettings.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RestaurantResponse response = service.updateStatus(
                new RestaurantStatusUpdateRequest(RestaurantStatus.BUSY, true, true, "Kitchen maintenance"));

        assertThat(response.status()).isEqualTo(RestaurantStatus.BUSY);
        assertThat(response.maintenanceMode()).isTrue();
        assertThat(response.canAcceptOrders()).isFalse();
        verify(repository).save(settings);
    }
}
