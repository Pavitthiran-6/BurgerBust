package com.burgerburst.controller;

import com.burgerburst.dto.cart.AddCartItemRequest;
import com.burgerburst.dto.cart.ApplyCouponRequest;
import com.burgerburst.dto.cart.CartResponse;
import com.burgerburst.dto.cart.UpdateCartItemRequest;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.security.AuthenticatedUser;
import com.burgerburst.security.UserPrincipal;
import com.burgerburst.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AuthenticatedUser
@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Cart")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get the current customer's validated cart and totals")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved", cartService.getCart(principal.uuid())));
    }

    @PostMapping("/items")
    @Operation(summary = "Add a product to the cart")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddCartItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item added to cart", cartService.addItem(principal.uuid(), request)));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Set a cart item's quantity")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cart item updated", cartService.updateItem(principal.uuid(), itemId, request)));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove an item from the cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID itemId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cart item removed", cartService.removeItem(principal.uuid(), itemId)));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items and coupon from the cart")
    public ResponseEntity<ApiResponse<Void>> clear(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clear(principal.uuid());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }

    @PostMapping("/coupon")
    @Operation(summary = "Validate and apply one coupon to the cart")
    public ResponseEntity<ApiResponse<CartResponse>> applyCoupon(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ApplyCouponRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Coupon applied", cartService.applyCoupon(principal.uuid(), request)));
    }

    @DeleteMapping("/coupon")
    @Operation(summary = "Remove the applied coupon")
    public ResponseEntity<ApiResponse<CartResponse>> removeCoupon(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Coupon removed", cartService.removeCoupon(principal.uuid())));
    }
}

