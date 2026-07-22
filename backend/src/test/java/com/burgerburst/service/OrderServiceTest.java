package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

import com.burgerburst.config.CommerceProperties;
import com.burgerburst.dto.order.OrderStatusUpdateRequest;
import com.burgerburst.entity.CustomerOrder;
import com.burgerburst.entity.Cart;
import com.burgerburst.entity.CartItem;
import com.burgerburst.entity.Inventory;
import com.burgerburst.entity.OrderItem;
import com.burgerburst.entity.OrderStatus;
import com.burgerburst.entity.PaymentMethod;
import com.burgerburst.entity.Product;
import com.burgerburst.entity.User;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.repository.CartRepository;
import com.burgerburst.repository.CouponRedemptionRepository;
import com.burgerburst.repository.InventoryHistoryRepository;
import com.burgerburst.repository.InventoryRepository;
import com.burgerburst.repository.OrderRepository;
import com.burgerburst.repository.ProductRepository;
import com.burgerburst.repository.RestaurantSettingsRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private CartRepository cartRepository;
    @Mock private CartService cartService;
    @Mock private CartPricingService pricingService;
    @Mock private InventoryRepository inventoryRepository;
    @Mock private InventoryHistoryRepository inventoryHistoryRepository;
    @Mock private ProductRepository productRepository;
    @Mock private RestaurantSettingsRepository settingsRepository;
    @Mock private CouponRedemptionRepository couponRedemptionRepository;
    @Mock private RewardService rewardService;
    @Mock private ApplicationEventPublisher eventPublisher;

    private OrderService service;
    private CustomerOrder order;
    private User user;

    @BeforeEach
    void setUp() {
        service = new OrderService(
                orderRepository, cartRepository, cartService, pricingService, inventoryRepository,
                inventoryHistoryRepository, productRepository, settingsRepository, couponRedemptionRepository,
                rewardService, new CommerceProperties(new BigDecimal("0.01"), 1, new BigDecimal("0.50"), 20),
                eventPublisher, Clock.fixed(Instant.parse("2026-07-21T12:00:00Z"), ZoneOffset.UTC));
        user = new User();
        user.setUuid(UUID.randomUUID());
        order = new CustomerOrder();
        order.setUuid(UUID.randomUUID());
        order.setOrderNumber("BB-1");
        order.setUser(user);
        order.setTotal(new BigDecimal("20.00"));
    }

    @Test
    void rejectsInvalidStatusTransition() {
        order.setStatus(OrderStatus.PREPARING);
        when(orderRepository.findByUuidAndDeletedAtIsNull(order.getUuid())).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> service.updateStatus(
                order.getUuid(), new OrderStatusUpdateRequest(OrderStatus.CANCELLED, null)))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("Invalid");
    }

    @Test
    void deliveredOrderEarnsRewardsOnce() {
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        when(orderRepository.findByUuidAndDeletedAtIsNull(order.getUuid())).thenReturn(Optional.of(order));
        when(rewardService.earn(user.getUuid(), order.getTotal(), order.getUuid())).thenReturn(20);
        when(orderRepository.save(order)).thenReturn(order);

        var response = service.updateStatus(
                order.getUuid(), new OrderStatusUpdateRequest(OrderStatus.DELIVERED, "Delivered"));

        assertThat(response.status()).isEqualTo(OrderStatus.DELIVERED);
        assertThat(order.getRewardPointsEarned()).isEqualTo(20);
        assertThat(order.getStatusHistory()).hasSize(1);
        verify(eventPublisher).publishEvent(any(com.burgerburst.event.CommerceNotificationEvent.class));
    }

    @Test
    void cancellationRestoresInventoryAndRedeemedRewards() {
        order.setStatus(OrderStatus.PLACED);
        order.setRewardPointsUsed(50);
        Product product = new Product();
        product.setUuid(UUID.randomUUID());
        product.setVisible(true);
        product.setAvailable(false);
        OrderItem item = new OrderItem();
        item.setProduct(product);
        item.setProductUuid(product.getUuid());
        item.setQuantity(2);
        item.setUnitPrice(BigDecimal.TEN);
        item.setLineTotal(new BigDecimal("20.00"));
        order.addItem(item);
        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setVisible(true);
        inventory.setStockQuantity(3);
        when(orderRepository.findByUuidAndUserUuidAndDeletedAtIsNull(order.getUuid(), user.getUuid()))
                .thenReturn(Optional.of(order));
        when(inventoryRepository.findForUpdateByProductUuidAndDeletedAtIsNull(product.getUuid()))
                .thenReturn(Optional.of(inventory));
        when(couponRedemptionRepository.findByOrderUuidAndDeletedAtIsNull(order.getUuid()))
                .thenReturn(Optional.empty());
        when(orderRepository.save(order)).thenReturn(order);

        service.cancel(user.getUuid(), order.getUuid(), "Changed mind");

        assertThat(inventory.getStockQuantity()).isEqualTo(5);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        verify(rewardService).refund(user.getUuid(), 50, order.getUuid());
        verify(inventoryHistoryRepository).save(any());
    }

    @Test
    void unpaidRazorpayCancellationKeepsCartAndDoesNotRefundUnredeemedPoints() {
        order.setStatus(OrderStatus.PAYMENT_PENDING);
        order.setPaymentMethod(PaymentMethod.RAZORPAY);
        order.setRewardPointsUsed(50);
        Product product = new Product();
        product.setUuid(UUID.randomUUID());
        product.setVisible(true);
        OrderItem item = new OrderItem();
        item.setProduct(product);
        item.setProductUuid(product.getUuid());
        item.setQuantity(1);
        item.setUnitPrice(BigDecimal.TEN);
        item.setLineTotal(BigDecimal.TEN);
        order.addItem(item);
        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setVisible(true);
        inventory.setStockQuantity(2);
        when(orderRepository.findByUuidAndUserUuidAndDeletedAtIsNull(order.getUuid(), user.getUuid()))
                .thenReturn(Optional.of(order));
        when(inventoryRepository.findForUpdateByProductUuidAndDeletedAtIsNull(product.getUuid()))
                .thenReturn(Optional.of(inventory));
        when(orderRepository.save(order)).thenReturn(order);

        service.cancel(user.getUuid(), order.getUuid(), "Payment window closed");

        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(inventory.getStockQuantity()).isEqualTo(3);
        verify(rewardService, never()).refund(any(), any(Integer.class), any());
        verify(couponRedemptionRepository, never()).findByOrderUuidAndDeletedAtIsNull(any());
        verify(cartRepository, never()).save(any());
    }

    @Test
    void verifiedRazorpayPaymentClearsOnlyPurchasedItemsAndConfirmsOrder() {
        order.setStatus(OrderStatus.PAYMENT_PENDING);
        order.setPaymentMethod(PaymentMethod.RAZORPAY);
        order.setCouponDiscount(BigDecimal.ZERO);
        order.setRewardPointsUsed(0);
        Product product = new Product();
        product.setUuid(UUID.randomUUID());
        OrderItem purchased = new OrderItem();
        purchased.setProduct(product);
        purchased.setProductUuid(product.getUuid());
        purchased.setQuantity(1);
        purchased.setUnitPrice(BigDecimal.TEN);
        purchased.setLineTotal(BigDecimal.TEN);
        order.addItem(purchased);
        Cart cart = new Cart();
        cart.setUser(user);
        CartItem cartItem = new CartItem();
        cartItem.setProduct(product);
        cartItem.setQuantity(2);
        cart.addItem(cartItem);
        when(orderRepository.findForUpdateByUuidAndDeletedAtIsNull(order.getUuid()))
                .thenReturn(Optional.of(order));
        when(cartRepository.findByUserUuidAndDeletedAtIsNull(user.getUuid())).thenReturn(Optional.of(cart));
        when(orderRepository.save(order)).thenReturn(order);

        var response = service.completePaidOrder(order.getUuid());

        assertThat(response.status()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(cart.getItems()).singleElement().extracting(CartItem::getQuantity).isEqualTo(1);
        verify(rewardService).redeem(user.getUuid(), 0, order.getUuid());
        verify(cartRepository).save(cart);
    }

    @Test
    void adminListUsesTypedEmptySearchInsteadOfANullPostgresParameter() {
        when(orderRepository.searchAdmin(isNull(), eq(""), any(Pageable.class)))
                .thenReturn(Page.empty());

        var response = service.getAdminOrders(null, "  ", 0, 25);

        assertThat(response.content()).isEmpty();
        verify(orderRepository).searchAdmin(isNull(), eq(""), any(Pageable.class));
    }
}
