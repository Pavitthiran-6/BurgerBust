package com.burgerburst.dto.product;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record ProductRequest(
        @NotBlank @Size(max = 160) String name,
        @Size(max = 2000) String description,
        @NotNull @DecimalMin("0.00") BigDecimal price,
        @DecimalMin("0.00") BigDecimal offerPrice,
        @Size(max = 1000) String imageUrl,
        @NotNull UUID categoryUuid,
        boolean available,
        boolean visible,
        boolean featured,
        boolean recommended,
        boolean bestseller,
        boolean popular,
        @NotNull @DecimalMin("0.00") @DecimalMax("5.00") BigDecimal rating,
        @PositiveOrZero int reviewCount,
        @Positive int preparationTime,
        @PositiveOrZero Integer calories,
        boolean veg) {

    @AssertTrue(message = "Offer price must not exceed the regular price")
    public boolean isOfferPriceValid() {
        return offerPrice == null || price == null || offerPrice.compareTo(price) <= 0;
    }
}
