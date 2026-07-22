package com.burgerburst.service;

import com.burgerburst.dto.restaurant.OperatingHoursRequest;
import com.burgerburst.dto.restaurant.OperatingHoursResponse;
import com.burgerburst.dto.restaurant.RestaurantResponse;
import com.burgerburst.dto.restaurant.RestaurantStatusUpdateRequest;
import com.burgerburst.dto.restaurant.RestaurantUpdateRequest;
import com.burgerburst.entity.RestaurantOperatingHours;
import com.burgerburst.entity.RestaurantSettings;
import com.burgerburst.entity.RestaurantStatus;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.RestaurantSettingsRepository;
import java.time.DayOfWeek;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantSettingsRepository restaurantSettingsRepository;

    @Transactional(readOnly = true)
    public RestaurantResponse getRestaurant() {
        return toResponse(findSettings());
    }

    @Transactional
    public RestaurantResponse update(RestaurantUpdateRequest request) {
        validateOperatingDays(request.operatingHours());
        RestaurantSettings settings = findSettings();
        settings.setRestaurantName(request.name().strip());
        settings.setTagline(trimToNull(request.tagline()));
        settings.setSupportEmail(trimToNull(request.email()));
        settings.setSupportPhone(trimToNull(request.contactNumber()));
        settings.setTimeZone(request.timeZone());
        settings.setCurrency(request.currency());
        settings.setMinimumOrderAmount(request.minimumOrderAmount());
        settings.setDeliveryRadiusKm(request.deliveryRadiusKm());
        settings.setDeliveryFee(request.deliveryFee());
        settings.setTaxRate(request.taxRate());
        settings.setEstimatedDeliveryMinutes(request.estimatedDeliveryMinutes());
        settings.setStatus(request.status());
        settings.setOrderingEnabled(request.orderingEnabled());
        settings.setServiceAvailable(request.serviceAvailable());
        settings.setMaintenanceMode(request.maintenanceMode());
        settings.setMaintenanceMessage(trimToNull(request.maintenanceMessage()));
        settings.setBannerUrl(trimToNull(request.bannerUrl()));
        settings.setLogoUrl(trimToNull(request.logoUrl()));
        settings.setAddressLine1(trimToNull(request.addressLine1()));
        settings.setAddressLine2(trimToNull(request.addressLine2()));
        settings.setCity(trimToNull(request.city()));
        settings.setState(trimToNull(request.state()));
        settings.setPostalCode(trimToNull(request.postalCode()));
        settings.setCountry(trimToNull(request.country()));
        settings.setFacebookUrl(trimToNull(request.facebookUrl()));
        settings.setInstagramUrl(trimToNull(request.instagramUrl()));
        settings.setXUrl(trimToNull(request.xUrl()));
        settings.setGstNumber(trimToNull(request.gstNumber()));
        settings.setFssaiNumber(trimToNull(request.fssaiNumber()));
        settings.replaceOperatingHours(request.operatingHours().stream().map(this::toEntity).toList());
        return toResponse(restaurantSettingsRepository.save(settings));
    }

    @Transactional
    public RestaurantResponse updateStatus(RestaurantStatusUpdateRequest request) {
        RestaurantSettings settings = findSettings();
        settings.setStatus(request.status());
        if (request.serviceAvailable() != null) {
            settings.setServiceAvailable(request.serviceAvailable());
        }
        if (request.maintenanceMode() != null) {
            settings.setMaintenanceMode(request.maintenanceMode());
        }
        if (request.maintenanceMessage() != null) {
            settings.setMaintenanceMessage(trimToNull(request.maintenanceMessage()));
        }
        return toResponse(restaurantSettingsRepository.save(settings));
    }

    private RestaurantSettings findSettings() {
        return restaurantSettingsRepository.findFirstByDeletedAtIsNullOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant settings not found"));
    }

    private void validateOperatingDays(List<OperatingHoursRequest> hours) {
        EnumSet<DayOfWeek> days = EnumSet.noneOf(DayOfWeek.class);
        hours.forEach(hour -> days.add(hour.dayOfWeek()));
        if (days.size() != DayOfWeek.values().length) {
            throw new IllegalArgumentException("Operating hours must contain each day exactly once");
        }
    }

    private RestaurantOperatingHours toEntity(OperatingHoursRequest request) {
        RestaurantOperatingHours hours = new RestaurantOperatingHours();
        hours.setDayOfWeek(request.dayOfWeek());
        hours.setOpenTime(request.openTime());
        hours.setCloseTime(request.closeTime());
        hours.setClosed(request.closed());
        return hours;
    }

    private RestaurantResponse toResponse(RestaurantSettings settings) {
        List<OperatingHoursResponse> hours = settings.getOperatingHours().stream()
                .filter(hour -> !hour.isDeleted())
                .sorted(Comparator.comparingInt(hour -> hour.getDayOfWeek().getValue()))
                .map(hour -> new OperatingHoursResponse(
                        hour.getDayOfWeek(), hour.getOpenTime(), hour.getCloseTime(), hour.isClosed()))
                .toList();
        boolean canAcceptOrders = settings.isOrderingEnabled()
                && settings.isServiceAvailable()
                && !settings.isMaintenanceMode()
                && settings.getStatus() != RestaurantStatus.CLOSED;
        return new RestaurantResponse(
                settings.getRestaurantName(), settings.getTagline(), settings.getStatus(), canAcceptOrders,
                settings.isOrderingEnabled(), settings.isServiceAvailable(), settings.isMaintenanceMode(),
                settings.getMaintenanceMessage(), settings.getMinimumOrderAmount(), settings.getDeliveryRadiusKm(),
                settings.getDeliveryFee(), settings.getTaxRate(), settings.getEstimatedDeliveryMinutes(), settings.getCurrency(),
                settings.getTimeZone(), settings.getBannerUrl(), settings.getLogoUrl(), settings.getSupportPhone(),
                settings.getSupportEmail(), settings.getAddressLine1(), settings.getAddressLine2(), settings.getCity(),
                settings.getState(), settings.getPostalCode(), settings.getCountry(), settings.getFacebookUrl(),
                settings.getInstagramUrl(), settings.getXUrl(), settings.getGstNumber(), settings.getFssaiNumber(), hours);
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
