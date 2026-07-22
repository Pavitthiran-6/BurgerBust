package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.burgerburst.config.CommerceProperties;
import com.burgerburst.entity.Cart;
import com.burgerburst.entity.CartItem;
import com.burgerburst.entity.Product;
import com.burgerburst.entity.RestaurantSettings;
import com.burgerburst.entity.User;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CartPricingServiceTest {

    @Mock private CouponService couponService;

    private CartPricingService service;
    private Cart cart;
    private RestaurantSettings settings;

    @BeforeEach
    void setUp() {
        service = new CartPricingService(couponService,
                new CommerceProperties(new BigDecimal("0.01"), 1, new BigDecimal("0.50"), 20));
        cart = new Cart();
        cart.setUser(new User());
        settings = new RestaurantSettings();
        settings.setTaxRate(new BigDecimal("0.0500"));
        settings.setDeliveryFee(new BigDecimal("3.99"));
        settings.setMinimumOrderAmount(new BigDecimal("5.00"));
        settings.setCurrency("USD");
    }

    @Test
    void usesOfferPriceAndCalculatesTaxAndDelivery() {
        addItem("10.00", "8.00", 2);
        when(couponService.calculateDiscount(null, cart.getUser(), new BigDecimal("16.00")))
                .thenReturn(new BigDecimal("0.00"));

        CartPricingService.PricingResult result = service.calculate(cart, settings, 0);

        assertThat(result.subtotal()).isEqualByComparingTo("16.00");
        assertThat(result.tax()).isEqualByComparingTo("0.80");
        assertThat(result.deliveryFee()).isEqualByComparingTo("3.99");
        assertThat(result.total()).isEqualByComparingTo("20.79");
        assertThat(result.minimumOrderMet()).isTrue();
    }

    @Test
    void capsRewardRedemptionAtConfiguredRatio() {
        addItem("16.00", null, 1);
        when(couponService.calculateDiscount(null, cart.getUser(), new BigDecimal("16.00")))
                .thenReturn(new BigDecimal("0.00"));

        CartPricingService.PricingResult result = service.calculate(cart, settings, 2000);

        assertThat(result.rewardDiscount()).isEqualByComparingTo("8.00");
        assertThat(result.tax()).isEqualByComparingTo("0.40");
    }

    @Test
    void emptyCartHasNoDeliveryFee() {
        when(couponService.calculateDiscount(null, cart.getUser(), new BigDecimal("0.00")))
                .thenReturn(new BigDecimal("0.00"));

        CartPricingService.PricingResult result = service.calculate(cart, settings, 0);

        assertThat(result.deliveryFee()).isZero();
        assertThat(result.minimumOrderMet()).isFalse();
    }

    private void addItem(String price, String offerPrice, int quantity) {
        Product product = new Product();
        product.setPrice(new BigDecimal(price));
        product.setOfferPrice(offerPrice == null ? null : new BigDecimal(offerPrice));
        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setUnitPrice(product.getOfferPrice() == null ? product.getPrice() : product.getOfferPrice());
        cart.addItem(item);
    }
}
