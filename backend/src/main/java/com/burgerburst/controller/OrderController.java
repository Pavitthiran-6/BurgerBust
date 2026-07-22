package com.burgerburst.controller;

import com.burgerburst.dto.cart.CartResponse;
import com.burgerburst.dto.order.CancelOrderRequest;
import com.burgerburst.dto.order.CreateOrderRequest;
import com.burgerburst.dto.order.OrderResponse;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.response.PageResponse;
import com.burgerburst.security.AuthenticatedUser;
import com.burgerburst.security.UserPrincipal;
import com.burgerburst.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@AuthenticatedUser
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Validate the cart and create an order atomically")
    public ResponseEntity<ApiResponse<OrderResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created", orderService.create(principal.uuid(), request)));
    }

    @GetMapping
    @Operation(summary = "Get the customer's paginated order history")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Orders retrieved", orderService.getOrders(principal.uuid(), page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details and status timeline")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Order retrieved", orderService.getOrder(principal.uuid(), id)));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an eligible order and restore inventory and rewards")
    public ResponseEntity<ApiResponse<OrderResponse>> cancel(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) CancelOrderRequest request) {
        String reason = request == null ? null : request.reason();
        return ResponseEntity.ok(ApiResponse.success(
                "Order cancelled", orderService.cancel(principal.uuid(), id, reason)));
    }

    @PostMapping("/{id}/reorder")
    @Operation(summary = "Add every currently available order item back to the cart")
    public ResponseEntity<ApiResponse<CartResponse>> reorder(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Order items added to cart", orderService.reorder(principal.uuid(), id)));
    }
}

