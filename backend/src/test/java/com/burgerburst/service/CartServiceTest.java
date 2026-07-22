package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.config.CommerceProperties;
import com.burgerburst.dto.cart.AddCartItemRequest;
import com.burgerburst.dto.cart.ApplyCouponRequest;
import com.burgerburst.entity.Cart;
import com.burgerburst.entity.CartItem;
import com.burgerburst.entity.Category;
import com.burgerburst.entity.Coupon;
import com.burgerburst.entity.Inventory;
import com.burgerburst.entity.Product;
import com.burgerburst.entity.RestaurantSettings;
import com.burgerburst.entity.User;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.repository.CartItemRepository;
import com.burgerburst.repository.CartRepository;
import com.burgerburst.repository.InventoryRepository;
import com.burgerburst.repository.ProductRepository;
import com.burgerburst.repository.RestaurantSettingsRepository;
import com.burgerburst.repository.UserRepository;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private InventoryRepository inventoryRepository;
    @Mock private UserRepository userRepository;
    @Mock private RestaurantSettingsRepository settingsRepository;
    @Mock private CouponService couponService;
    @Mock private CartPricingService pricingService;
    @Mock private ApplicationEventPublisher eventPublisher;

    private CartService service;
    private User user;
    private Cart cart;
    private Product product;
    private Inventory inventory;

    @BeforeEach
    void setUp() {
        service = new CartService(
                cartRepository, cartItemRepository, productRepository, inventoryRepository, userRepository,
                settingsRepository, couponService, pricingService,
                new CommerceProperties(new BigDecimal("0.01"), 1, new BigDecimal("0.50"), 20), eventPublisher);
        user = new User();
        user.setUuid(UUID.randomUUID());
        cart = new Cart();
        cart.setUuid(UUID.randomUUID());
        cart.setUser(user);
        product = product();
        inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setVisible(true);
        inventory.setStockQuantity(10);
        when(cartRepository.findByUserUuidAndDeletedAtIsNull(user.getUuid())).thenReturn(Optional.of(cart));
    }

    @Test
    void addsAvailableProductUsingCurrentOfferPrice() {
        when(productRepository.findByUuidAndDeletedAtIsNull(product.getUuid())).thenReturn(Optional.of(product));
        when(inventoryRepository.findByProductUuidAndDeletedAtIsNull(product.getUuid())).thenReturn(Optional.of(inventory));
        stubResponse();

        var response = service.addItem(user.getUuid(), new AddCartItemRequest(product.getUuid(), 2));

        assertThat(cart.getItems()).hasSize(1);
        assertThat(cart.getItems().getFirst().getUnitPrice()).isEqualByComparingTo("8.00");
        assertThat(response.totalQuantity()).isEqualTo(2);
    }

    @Test
    void rejectsOutOfStockProduct() {
        inventory.setStockQuantity(0);
        when(productRepository.findByUuidAndDeletedAtIsNull(product.getUuid())).thenReturn(Optional.of(product));
        when(inventoryRepository.findByProductUuidAndDeletedAtIsNull(product.getUuid())).thenReturn(Optional.of(inventory));

        assertThatThrownBy(() -> service.addItem(
                user.getUuid(), new AddCartItemRequest(product.getUuid(), 1)))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("stock");
    }

    @Test
    void rejectsMergedQuantityAboveMaximum() {
        CartItem existing = new CartItem();
        existing.setProduct(product);
        existing.setQuantity(15);
        existing.setUnitPrice(new BigDecimal("8.00"));
        cart.addItem(existing);
        when(productRepository.findByUuidAndDeletedAtIsNull(product.getUuid())).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> service.addItem(
                user.getUuid(), new AddCartItemRequest(product.getUuid(), 10)))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("Maximum");
    }

    @Test
    void validatesAndAppliesSingleCoupon() {
        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQuantity(2);
        item.setUnitPrice(new BigDecimal("8.00"));
        cart.addItem(item);
        Coupon coupon = new Coupon();
        coupon.setCode("SAVE10");
        when(couponService.findAndValidate("SAVE10", user, new BigDecimal("16.00"))).thenReturn(coupon);
        when(inventoryRepository.findByProductUuidAndDeletedAtIsNull(product.getUuid())).thenReturn(Optional.of(inventory));
        stubResponse();

        service.applyCoupon(user.getUuid(), new ApplyCouponRequest("SAVE10"));

        assertThat(cart.getCoupon()).isSameAs(coupon);
        verify(eventPublisher).publishEvent(any(com.burgerburst.event.CommerceNotificationEvent.class));
    }

    private void stubResponse() {
        RestaurantSettings settings = new RestaurantSettings();
        settings.setMinimumOrderAmount(new BigDecimal("5.00"));
        settings.setTaxRate(new BigDecimal("0.05"));
        settings.setCurrency("USD");
        when(settingsRepository.findFirstByDeletedAtIsNullOrderByIdAsc()).thenReturn(Optional.of(settings));
        when(pricingService.calculate(eq(cart), eq(settings), eq(0))).thenReturn(
                new CartPricingService.PricingResult(
                        new BigDecimal("16.00"), BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("0.80"),
                        new BigDecimal("3.99"), new BigDecimal("20.79"), new BigDecimal("5.00"), true,
                        new BigDecimal("0.05"), "USD"));
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private Product product() {
        Category category = new Category();
        category.setUuid(UUID.randomUUID());
        category.setName("Burgers");
        category.setActive(true);
        Product value = new Product();
        value.setUuid(UUID.randomUUID());
        value.setName("Classic");
        value.setCategory(category);
        value.setPrice(new BigDecimal("10.00"));
        value.setOfferPrice(new BigDecimal("8.00"));
        value.setAvailable(true);
        value.setVisible(true);
        return value;
    }
}
