package com.burgerburst.entity;

import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "restaurant_settings")
public class RestaurantSettings extends BaseEntity {

    @Column(name = "restaurant_name", nullable = false, length = 120)
    private String restaurantName;

    @Column(length = 200)
    private String tagline;

    @Column(name = "support_email", length = 320)
    private String supportEmail;

    @Column(name = "support_phone", length = 20)
    private String supportPhone;

    @Column(name = "address_line_1", length = 200)
    private String addressLine1;

    @Column(name = "address_line_2", length = 200)
    private String addressLine2;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(length = 100)
    private String country;

    @Column(name = "time_zone", nullable = false, length = 50)
    private String timeZone = "Asia/Kolkata";

    @Column(nullable = false, length = 3)
    private String currency = "INR";

    @Column(name = "minimum_order_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal minimumOrderAmount = BigDecimal.ZERO;

    @Column(name = "ordering_enabled", nullable = false)
    private boolean orderingEnabled = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RestaurantStatus status = RestaurantStatus.OPEN;

    @Column(name = "delivery_radius_km", nullable = false, precision = 8, scale = 2)
    private BigDecimal deliveryRadiusKm = BigDecimal.TEN;

    @Column(name = "delivery_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(name = "tax_rate", nullable = false, precision = 6, scale = 4)
    private BigDecimal taxRate = new BigDecimal("0.0500");

    @Column(name = "estimated_delivery_minutes", nullable = false)
    private int estimatedDeliveryMinutes = 30;

    @Column(name = "banner_url", length = 1000)
    private String bannerUrl;

    @Column(name = "logo_url", length = 1000)
    private String logoUrl;

    @Column(name = "facebook_url", length = 1000)
    private String facebookUrl;

    @Column(name = "instagram_url", length = 1000)
    private String instagramUrl;

    @Column(name = "x_url", length = 1000)
    private String xUrl;

    @Column(name = "gst_number", length = 30)
    private String gstNumber;

    @Column(name = "fssai_number", length = 30)
    private String fssaiNumber;

    @Column(name = "service_available", nullable = false)
    private boolean serviceAvailable = true;

    @Column(name = "maintenance_mode", nullable = false)
    private boolean maintenanceMode;

    @Column(name = "maintenance_message", length = 500)
    private String maintenanceMessage;

    @OneToMany(mappedBy = "restaurantSettings", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RestaurantOperatingHours> operatingHours = new ArrayList<>();

    public void replaceOperatingHours(List<RestaurantOperatingHours> hours) {
        operatingHours.clear();
        hours.forEach(hour -> {
            hour.setRestaurantSettings(this);
            operatingHours.add(hour);
        });
    }
}
