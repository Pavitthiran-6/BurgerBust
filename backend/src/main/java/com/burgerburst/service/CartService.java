package com.burgerburst.service;

import com.burgerburst.config.CommerceProperties;
import com.burgerburst.dto.cart.AddCartItemRequest;
import com.burgerburst.dto.cart.ApplyCouponRequest;
import com.burgerburst.dto.cart.CartItemResponse;
import com.burgerburst.dto.cart.CartResponse;
import com.burgerburst.dto.cart.UpdateCartItemRequest;
import com.burgerburst.entity.Cart;
import com.burgerburst.entity.CartItem;
import com.burgerburst.entity.Coupon;
import com.burgerburst.entity.Inventory;
import com.burgerburst.entity.Product;
import com.burgerburst.entity.RestaurantSettings;
import com.burgerburst.entity.User;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.CartItemRepository;
import com.burgerburst.repository.CartRepository;
import com.burgerburst.repository.InventoryRepository;
import com.burgerburst.repository.ProductRepository;
import com.burgerburst.repository.RestaurantSettingsRepository;
import com.burgerburst.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final RestaurantSettingsRepository restaurantSettingsRepository;
    private final CouponService couponService;
    private final CartPricingService pricingService;
    private final CommerceProperties commerceProperties;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public CartResponse getCart(UUID userUuid) {
        return toResponse(getOrCreate(userUuid));
    }

    @Transactional
    public CartResponse addItem(UUID userUuid, AddCartItemRequest request) {
        Cart cart = getOrCreate(userUuid);
        Product product = productRepository.findByUuidAndDeletedAtIsNull(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        CartItem existing = cart.getItems().stream()
                .filter(item -> !item.isDeleted() && item.getProduct().getUuid().equals(product.getUuid()))
                .findFirst().orElse(null);
        int nextQuantity = request.quantity() + (existing == null ? 0 : existing.getQuantity());
        validateProduct(product, nextQuantity);
        BigDecimal currentPrice = effectivePrice(product);
        if (existing == null) {
            CartItem item = new CartItem();
            item.setProduct(product);
            item.setQuantity(nextQuantity);
            item.setUnitPrice(currentPrice);
            cart.addItem(item);
        } else {
            existing.setQuantity(nextQuantity);
            existing.setUnitPrice(currentPrice);
        }
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse updateItem(UUID userUuid, UUID itemUuid, UpdateCartItemRequest request) {
        CartItem item = findOwnedItem(userUuid, itemUuid);
        validateProduct(item.getProduct(), request.quantity());
        item.setQuantity(request.quantity());
        item.setUnitPrice(effectivePrice(item.getProduct()));
        cartItemRepository.save(item);
        return toResponse(item.getCart());
    }

    @Transactional
    public CartResponse removeItem(UUID userUuid, UUID itemUuid) {
        CartItem item = findOwnedItem(userUuid, itemUuid);
        Cart cart = item.getCart();
        cart.removeItem(item);
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public void clear(UUID userUuid) {
        Cart cart = getOrCreate(userUuid);
        cart.getItems().clear();
        cart.setCoupon(null);
        cartRepository.save(cart);
    }

    @Transactional
    public CartResponse applyCoupon(UUID userUuid, ApplyCouponRequest request) {
        Cart cart = getOrCreate(userUuid);
        if (cart.getItems().isEmpty()) {
            throw new BusinessRuleException("Cannot apply a coupon to an empty cart", HttpStatus.UNPROCESSABLE_ENTITY);
        }
        BigDecimal subtotal = subtotal(cart);
        Coupon coupon = couponService.findAndValidate(request.code(), cart.getUser(), subtotal);
        cart.setCoupon(coupon);
        cartRepository.save(cart);
        eventPublisher.publishEvent(new com.burgerburst.event.CommerceNotificationEvent(
                userUuid, com.burgerburst.entity.NotificationType.COUPON, "Coupon applied",
                "Coupon " + coupon.getCode() + " was applied to your cart.", null));
        return toResponse(cart);
    }

    @Transactional
    public CartResponse removeCoupon(UUID userUuid) {
        Cart cart = getOrCreate(userUuid);
        cart.setCoupon(null);
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public Cart getCartForCheckout(UUID userUuid) {
        return getOrCreate(userUuid);
    }

    private Cart getOrCreate(UUID userUuid) {
        return cartRepository.findByUserUuidAndDeletedAtIsNull(userUuid).orElseGet(() -> {
            User user = userRepository.findByUuidAndDeletedAtIsNull(userUuid)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }

    private CartItem findOwnedItem(UUID userUuid, UUID itemUuid) {
        return cartItemRepository.findByUuidAndCartUserUuidAndDeletedAtIsNull(itemUuid, userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
    }

    private void validateProduct(Product product, int quantity) {
        if (quantity > commerceProperties.maximumCartItemQuantity()) {
            throw new BusinessRuleException(
                    "Maximum quantity per product is " + commerceProperties.maximumCartItemQuantity(),
                    HttpStatus.UNPROCESSABLE_ENTITY);
        }
        if (!product.isAvailable() || !product.isVisible() || product.isDeleted()
                || !product.getCategory().isActive() || product.getCategory().isDeleted()) {
            throw new BusinessRuleException("Product is not available", HttpStatus.CONFLICT);
        }
        Inventory inventory = inventoryRepository.findByProductUuidAndDeletedAtIsNull(product.getUuid())
                .orElseThrow(() -> new BusinessRuleException("Product inventory is unavailable", HttpStatus.CONFLICT));
        if (!inventory.isVisible() || inventory.getStockQuantity() < quantity) {
            throw new BusinessRuleException("Requested quantity is not in stock", HttpStatus.CONFLICT);
        }
    }

    private CartResponse toResponse(Cart cart) {
        RestaurantSettings settings = restaurantSettingsRepository.findFirstByDeletedAtIsNullOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant settings not found"));
        CartPricingService.PricingResult pricing = pricingService.calculate(cart, settings, 0);
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .filter(item -> !item.isDeleted())
                .sorted(Comparator.comparing(CartItem::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toItemResponse)
                .toList();
        boolean itemsValid = itemResponses.stream().allMatch(
                item -> item.productAvailable() && item.stockAvailable());
        return new CartResponse(
                cart.getUuid(), itemResponses, itemResponses.size(),
                itemResponses.stream().mapToInt(CartItemResponse::quantity).sum(),
                cart.getCoupon() == null ? null : cart.getCoupon().getCode(),
                pricing.subtotal(), pricing.couponDiscount(), pricing.taxRate(), pricing.tax(),
                pricing.deliveryFee(), pricing.total(), pricing.minimumOrderAmount(), pricing.minimumOrderMet(),
                itemsValid && pricing.minimumOrderMet() && !itemResponses.isEmpty(), pricing.currency());
    }

    private CartItemResponse toItemResponse(CartItem item) {
        Product product = item.getProduct();
        BigDecimal currentPrice = effectivePrice(product);
        Inventory inventory = inventoryRepository.findByProductUuidAndDeletedAtIsNull(product.getUuid()).orElse(null);
        int stock = inventory == null ? 0 : inventory.getStockQuantity();
        boolean available = !product.isDeleted() && product.isAvailable() && product.isVisible()
                && product.getCategory().isActive() && !product.getCategory().isDeleted();
        boolean stockAvailable = inventory != null && inventory.isVisible() && stock >= item.getQuantity();
        return new CartItemResponse(
                item.getUuid(), product.getUuid(), product.getName(), product.getImageUrl(),
                product.getCategory().getName(), item.getQuantity(), currentPrice, item.getUnitPrice(),
                currentPrice.multiply(BigDecimal.valueOf(item.getQuantity())).setScale(2, RoundingMode.HALF_UP),
                item.getUnitPrice().compareTo(currentPrice) != 0, available, stockAvailable, stock);
    }

    private BigDecimal subtotal(Cart cart) {
        return cart.getItems().stream()
                .map(item -> effectivePrice(item.getProduct()).multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal effectivePrice(Product product) {
        return product.getOfferPrice() == null ? product.getPrice() : product.getOfferPrice();
    }
}
