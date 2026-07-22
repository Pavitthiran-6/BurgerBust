package com.burgerburst.service;

import com.burgerburst.config.CommerceProperties;
import com.burgerburst.dto.cart.CartResponse;
import com.burgerburst.dto.admin.AdminOrderResponse;
import com.burgerburst.dto.order.CreateOrderRequest;
import com.burgerburst.dto.order.DeliveryAddressRequest;
import com.burgerburst.dto.order.OrderAddressResponse;
import com.burgerburst.dto.order.OrderItemResponse;
import com.burgerburst.dto.order.OrderResponse;
import com.burgerburst.dto.order.OrderStatusResponse;
import com.burgerburst.dto.order.OrderStatusUpdateRequest;
import com.burgerburst.entity.Cart;
import com.burgerburst.entity.CartItem;
import com.burgerburst.entity.CouponRedemption;
import com.burgerburst.entity.CustomerOrder;
import com.burgerburst.entity.Inventory;
import com.burgerburst.entity.InventoryChangeType;
import com.burgerburst.entity.InventoryHistory;
import com.burgerburst.entity.NotificationType;
import com.burgerburst.entity.OrderItem;
import com.burgerburst.entity.OrderStatus;
import com.burgerburst.entity.OrderStatusHistory;
import com.burgerburst.entity.Product;
import com.burgerburst.entity.RestaurantOperatingHours;
import com.burgerburst.entity.RestaurantSettings;
import com.burgerburst.entity.RestaurantStatus;
import com.burgerburst.event.CommerceNotificationEvent;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.CartRepository;
import com.burgerburst.repository.CouponRedemptionRepository;
import com.burgerburst.repository.InventoryHistoryRepository;
import com.burgerburst.repository.InventoryRepository;
import com.burgerburst.repository.OrderRepository;
import com.burgerburst.repository.ProductRepository;
import com.burgerburst.repository.RestaurantSettingsRepository;
import com.burgerburst.response.PageResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = transitions();

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;
    private final CartPricingService pricingService;
    private final InventoryRepository inventoryRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final ProductRepository productRepository;
    private final RestaurantSettingsRepository restaurantSettingsRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;
    private final RewardService rewardService;
    private final CommerceProperties commerceProperties;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    @Transactional
    public OrderResponse create(UUID userUuid, CreateOrderRequest request) {
        Cart cart = cartService.getCartForCheckout(userUuid);
        if (cart.getItems().isEmpty()) {
            throw rule("Cart is empty");
        }
        RestaurantSettings settings = restaurantSettingsRepository.findFirstByDeletedAtIsNullOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant settings not found"));
        validateRestaurant(settings);
        validateRewardRequest(userUuid, request.rewardPoints());

        List<CartItem> items = cart.getItems().stream()
                .filter(item -> !item.isDeleted())
                .sorted(Comparator.comparing(item -> item.getProduct().getUuid()))
                .toList();
        List<Inventory> inventories = items.stream().map(item -> lockAndValidate(item)).toList();
        CartPricingService.PricingResult pricing = pricingService.calculate(cart, settings, request.rewardPoints());
        if (!pricing.minimumOrderMet()) {
            throw rule("Minimum order amount is " + pricing.minimumOrderAmount());
        }
        validateRewardCap(request.rewardPoints(), pricing.rewardDiscount());

        CustomerOrder order = buildOrder(cart, request, pricing);
        for (CartItem cartItem : items) order.addItem(toOrderItem(cartItem));
        addStatus(order, OrderStatus.PLACED, "Order placed");
        orderRepository.save(order);

        for (int index = 0; index < items.size(); index++) {
            reserveInventory(inventories.get(index), items.get(index), userUuid, order.getOrderNumber());
        }
        if (cart.getCoupon() != null) {
            CouponRedemption redemption = new CouponRedemption();
            redemption.setCoupon(cart.getCoupon());
            redemption.setUser(cart.getUser());
            redemption.setOrderUuid(order.getUuid());
            redemption.setDiscountAmount(pricing.couponDiscount());
            couponRedemptionRepository.save(redemption);
        }
        rewardService.redeem(userUuid, request.rewardPoints(), order.getUuid());
        cart.getItems().clear();
        cart.setCoupon(null);
        cartRepository.save(cart);
        publish(order, NotificationType.ORDER_CREATED, "Order placed",
                "Your order " + order.getOrderNumber() + " has been placed.");
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrders(UUID userUuid, int page, int size) {
        return PageResponse.from(orderRepository
                .findByUserUuidAndDeletedAtIsNullOrderByCreatedAtDesc(
                        userUuid, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)))
                .map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID userUuid, UUID orderUuid) {
        return toResponse(findOwned(userUuid, orderUuid));
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminOrderResponse> getAdminOrders(
            OrderStatus status, String search, int page, int size) {
        String normalizedSearch = search == null || search.isBlank() ? "" : search.strip();
        PageRequest pageable = PageRequest.of(
                Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(orderRepository.searchAdmin(status, normalizedSearch, pageable)
                .map(this::toAdminResponse));
    }

    @Transactional(readOnly = true)
    public AdminOrderResponse getAdminOrder(UUID orderUuid) {
        return toAdminResponse(orderRepository.findByUuidAndDeletedAtIsNull(orderUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found")));
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminOrderResponse> getAdminCustomerOrders(UUID userUuid, int page, int size) {
        return PageResponse.from(orderRepository.findByUserUuidAndDeletedAtIsNullOrderByCreatedAtDesc(
                        userUuid, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)))
                .map(this::toAdminResponse));
    }

    @Transactional
    public OrderResponse cancel(UUID userUuid, UUID orderUuid, String reason) {
        CustomerOrder order = findOwned(userUuid, orderUuid);
        if (!EnumSet.of(OrderStatus.PLACED, OrderStatus.CONFIRMED).contains(order.getStatus())) {
            throw rule("Order can no longer be cancelled");
        }
        cancelInternal(order, trimToNull(reason));
        return toResponse(order);
    }

    @Transactional
    public CartResponse reorder(UUID userUuid, UUID orderUuid) {
        CustomerOrder order = findOwned(userUuid, orderUuid);
        CartResponse result = null;
        for (OrderItem item : order.getItems()) {
            result = cartService.addItem(userUuid,
                    new com.burgerburst.dto.cart.AddCartItemRequest(item.getProductUuid(), item.getQuantity()));
        }
        if (result == null) throw rule("Order has no items to reorder");
        return result;
    }

    @Transactional
    public OrderResponse updateStatus(UUID orderUuid, OrderStatusUpdateRequest request) {
        CustomerOrder order = orderRepository.findByUuidAndDeletedAtIsNull(orderUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        Set<OrderStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(order.getStatus(), Set.of());
        if (!allowed.contains(request.status())) {
            throw rule("Invalid order status transition from " + order.getStatus() + " to " + request.status());
        }
        if (request.status() == OrderStatus.CANCELLED) {
            cancelInternal(order, trimToNull(request.note()));
            return toResponse(order);
        }
        order.setStatus(request.status());
        addStatus(order, request.status(), trimToNull(request.note()));
        if (request.status() == OrderStatus.DELIVERED && order.getRewardPointsEarned() == 0) {
            int earned = rewardService.earn(order.getUser().getUuid(), order.getTotal(), order.getUuid());
            order.setRewardPointsEarned(earned);
        }
        orderRepository.save(order);
        publishStatus(order);
        return toResponse(order);
    }

    private CustomerOrder buildOrder(
            Cart cart, CreateOrderRequest request, CartPricingService.PricingResult pricing) {
        CustomerOrder order = new CustomerOrder();
        UUID uuid = UUID.randomUUID();
        order.setUuid(uuid);
        order.setOrderNumber("BB-" + clock.instant().toString().substring(0, 10).replace("-", "")
                + "-" + uuid.toString().substring(0, 8).toUpperCase());
        order.setUser(cart.getUser());
        order.setStatus(OrderStatus.PLACED);
        order.setPaymentMethod(request.paymentMethod());
        order.setSubtotal(pricing.subtotal());
        order.setCouponDiscount(pricing.couponDiscount());
        order.setRewardDiscount(pricing.rewardDiscount());
        order.setTax(pricing.tax());
        order.setDeliveryFee(pricing.deliveryFee());
        order.setTotal(pricing.total());
        order.setCurrency(pricing.currency());
        order.setCouponCode(cart.getCoupon() == null ? null : cart.getCoupon().getCode());
        order.setRewardPointsUsed(request.rewardPoints());
        applyAddress(order, request.address());
        order.setPlacedAt(clock.instant());
        return order;
    }

    private OrderItem toOrderItem(CartItem cartItem) {
        BigDecimal unitPrice = pricingService.effectivePrice(cartItem);
        OrderItem item = new OrderItem();
        item.setProduct(cartItem.getProduct());
        item.setProductUuid(cartItem.getProduct().getUuid());
        item.setProductName(cartItem.getProduct().getName());
        item.setImageUrl(cartItem.getProduct().getImageUrl());
        item.setQuantity(cartItem.getQuantity());
        item.setUnitPrice(unitPrice);
        item.setLineTotal(unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP));
        return item;
    }

    private Inventory lockAndValidate(CartItem item) {
        Product product = item.getProduct();
        BigDecimal currentPrice = pricingService.effectivePrice(item);
        if (item.getUnitPrice().compareTo(currentPrice) != 0) {
            throw new BusinessRuleException(
                    "Price changed for " + product.getName() + "; review the cart before checkout", HttpStatus.CONFLICT);
        }
        if (product.isDeleted() || !product.isAvailable() || !product.isVisible()
                || product.getCategory().isDeleted() || !product.getCategory().isActive()) {
            throw new BusinessRuleException(product.getName() + " is unavailable", HttpStatus.CONFLICT);
        }
        Inventory inventory = inventoryRepository.findForUpdateByProductUuidAndDeletedAtIsNull(product.getUuid())
                .orElseThrow(() -> new BusinessRuleException(product.getName() + " has no inventory", HttpStatus.CONFLICT));
        if (!inventory.isVisible() || inventory.getStockQuantity() < item.getQuantity()) {
            throw new BusinessRuleException(product.getName() + " is out of stock", HttpStatus.CONFLICT);
        }
        return inventory;
    }

    private void reserveInventory(
            Inventory inventory, CartItem item, UUID userUuid, String orderNumber) {
        int previous = inventory.getStockQuantity();
        int next = previous - item.getQuantity();
        inventory.setStockQuantity(next);
        inventoryRepository.save(inventory);
        if (next == 0) {
            inventory.getProduct().setAvailable(false);
            productRepository.save(inventory.getProduct());
        }
        saveInventoryHistory(inventory, previous, next, InventoryChangeType.ORDER_RESERVED,
                "Reserved for " + orderNumber, userUuid);
    }

    private void cancelInternal(CustomerOrder order, String reason) {
        for (OrderItem item : order.getItems().stream()
                .sorted(Comparator.comparing(OrderItem::getProductUuid)).toList()) {
            Inventory inventory = inventoryRepository.findForUpdateByProductUuidAndDeletedAtIsNull(item.getProductUuid())
                    .orElseThrow(() -> new BusinessRuleException("Inventory missing while cancelling order"));
            int previous = inventory.getStockQuantity();
            int next = previous + item.getQuantity();
            inventory.setStockQuantity(next);
            inventoryRepository.save(inventory);
            if (inventory.isVisible() && inventory.getProduct().isVisible() && !inventory.getProduct().isDeleted()) {
                inventory.getProduct().setAvailable(true);
                productRepository.save(inventory.getProduct());
            }
            saveInventoryHistory(inventory, previous, next, InventoryChangeType.ORDER_CANCELLED,
                    "Restored from " + order.getOrderNumber(), order.getUser().getUuid());
        }
        rewardService.refund(order.getUser().getUuid(), order.getRewardPointsUsed(), order.getUuid());
        couponRedemptionRepository.findByOrderUuidAndDeletedAtIsNull(order.getUuid()).ifPresent(redemption -> {
            redemption.markDeleted();
            couponRedemptionRepository.save(redemption);
        });
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(reason == null ? "Cancelled by customer" : reason);
        addStatus(order, OrderStatus.CANCELLED, order.getCancellationReason());
        orderRepository.save(order);
        publish(order, NotificationType.ORDER_CANCELLED, "Order cancelled",
                "Order " + order.getOrderNumber() + " was cancelled.");
    }

    private void validateRestaurant(RestaurantSettings settings) {
        if (!settings.isOrderingEnabled() || !settings.isServiceAvailable() || settings.isMaintenanceMode()
                || settings.getStatus() == RestaurantStatus.CLOSED) {
            throw new BusinessRuleException("Restaurant is not accepting orders", HttpStatus.SERVICE_UNAVAILABLE);
        }
        ZonedDateTime now = ZonedDateTime.ofInstant(clock.instant(), ZoneId.of(settings.getTimeZone()));
        RestaurantOperatingHours hours = settings.getOperatingHours().stream()
                .filter(value -> !value.isDeleted() && value.getDayOfWeek() == now.getDayOfWeek())
                .findFirst().orElse(null);
        if (hours == null || hours.isClosed() || !within(now.toLocalTime(), hours.getOpenTime(), hours.getCloseTime())) {
            throw new BusinessRuleException("Restaurant is outside operating hours", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    private boolean within(LocalTime now, LocalTime open, LocalTime close) {
        if (open == null || close == null) return false;
        if (close.isAfter(open)) return !now.isBefore(open) && now.isBefore(close);
        return !now.isBefore(open) || now.isBefore(close);
    }

    private void validateRewardRequest(UUID userUuid, int points) {
        if (points > rewardService.balance(userUuid)) {
            throw new BusinessRuleException("Insufficient reward points", HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    private void validateRewardCap(int requestedPoints, BigDecimal appliedDiscount) {
        BigDecimal requestedValue = commerceProperties.rewardPointValue().multiply(BigDecimal.valueOf(requestedPoints));
        if (requestedValue.subtract(appliedDiscount).compareTo(new BigDecimal("0.01")) >= 0) {
            throw new BusinessRuleException(
                    "Reward redemption exceeds the allowed order percentage", HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    private void applyAddress(CustomerOrder order, DeliveryAddressRequest address) {
        order.setRecipientName(address.recipientName().strip());
        order.setRecipientPhone(address.phone().strip());
        order.setAddressLine1(address.addressLine1().strip());
        order.setAddressLine2(trimToNull(address.addressLine2()));
        order.setCity(address.city().strip());
        order.setState(address.state().strip());
        order.setPostalCode(address.postalCode().strip());
        order.setDeliveryInstructions(trimToNull(address.deliveryInstructions()));
    }

    private CustomerOrder findOwned(UUID userUuid, UUID orderUuid) {
        return orderRepository.findByUuidAndUserUuidAndDeletedAtIsNull(orderUuid, userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    private void addStatus(CustomerOrder order, OrderStatus status, String note) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setStatus(status);
        history.setNote(note);
        history.setOccurredAt(clock.instant());
        order.addStatus(history);
    }

    private void saveInventoryHistory(
            Inventory inventory, int previous, int next, InventoryChangeType type, String reason, UUID actor) {
        InventoryHistory history = new InventoryHistory();
        history.setInventory(inventory);
        history.setPreviousQuantity(previous);
        history.setNewQuantity(next);
        history.setChangeType(type);
        history.setReason(reason);
        history.setChangedBy(actor);
        inventoryHistoryRepository.save(history);
    }

    private OrderResponse toResponse(CustomerOrder order) {
        List<OrderItemResponse> items = order.getItems().stream().filter(item -> !item.isDeleted())
                .map(item -> new OrderItemResponse(
                        item.getUuid(), item.getProductUuid(), item.getProductName(), item.getImageUrl(),
                        item.getQuantity(), item.getUnitPrice(), item.getLineTotal()))
                .toList();
        List<OrderStatusResponse> timeline = order.getStatusHistory().stream().filter(item -> !item.isDeleted())
                .sorted(Comparator.comparing(OrderStatusHistory::getOccurredAt))
                .map(item -> new OrderStatusResponse(item.getUuid(), item.getStatus(), item.getNote(), item.getOccurredAt()))
                .toList();
        OrderAddressResponse address = new OrderAddressResponse(
                order.getRecipientName(), order.getRecipientPhone(), order.getAddressLine1(), order.getAddressLine2(),
                order.getCity(), order.getState(), order.getPostalCode(), order.getDeliveryInstructions());
        return new OrderResponse(
                order.getUuid(), order.getOrderNumber(), order.getStatus(), order.getPaymentMethod(), items,
                order.getSubtotal(), order.getCouponDiscount(), order.getRewardDiscount(), order.getTax(),
                order.getDeliveryFee(), order.getTotal(), order.getCurrency(), order.getCouponCode(),
                order.getRewardPointsUsed(), order.getRewardPointsEarned(), address, timeline,
                order.getCancellationReason(), order.getPlacedAt(), order.getCreatedAt());
    }

    private AdminOrderResponse toAdminResponse(CustomerOrder order) {
        return new AdminOrderResponse(
                toResponse(order), order.getUser().getUuid(),
                order.getUser().getFullName(), order.getUser().getEmail());
    }

    private void publish(CustomerOrder order, NotificationType type, String title, String message) {
        eventPublisher.publishEvent(new CommerceNotificationEvent(
                order.getUser().getUuid(), type, title, message, order.getUuid()));
    }

    private void publishStatus(CustomerOrder order) {
        NotificationType type = switch (order.getStatus()) {
            case CONFIRMED -> NotificationType.ORDER_CONFIRMED;
            case PREPARING -> NotificationType.ORDER_PREPARING;
            case READY -> NotificationType.ORDER_READY;
            case OUT_FOR_DELIVERY -> NotificationType.OUT_FOR_DELIVERY;
            case DELIVERED -> NotificationType.ORDER_DELIVERED;
            default -> null;
        };
        if (type != null) publish(order, type, "Order " + order.getStatus().name().replace('_', ' '),
                "Order " + order.getOrderNumber() + " is now " + order.getStatus().name().replace('_', ' ') + ".");
    }

    private BusinessRuleException rule(String message) {
        return new BusinessRuleException(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }

    private static Map<OrderStatus, Set<OrderStatus>> transitions() {
        Map<OrderStatus, Set<OrderStatus>> transitions = new EnumMap<>(OrderStatus.class);
        transitions.put(OrderStatus.PLACED, EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED));
        transitions.put(OrderStatus.CONFIRMED, EnumSet.of(OrderStatus.PREPARING, OrderStatus.CANCELLED));
        transitions.put(OrderStatus.PREPARING, EnumSet.of(OrderStatus.READY));
        transitions.put(OrderStatus.READY, EnumSet.of(OrderStatus.OUT_FOR_DELIVERY));
        transitions.put(OrderStatus.OUT_FOR_DELIVERY, EnumSet.of(OrderStatus.DELIVERED));
        transitions.put(OrderStatus.DELIVERED, EnumSet.of(OrderStatus.REFUNDED));
        return transitions;
    }
}
