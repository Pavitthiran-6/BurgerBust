package com.burgerburst.controller;

import com.burgerburst.dto.admin.AdminOrderResponse;
import com.burgerburst.dto.order.OrderResponse;
import com.burgerburst.dto.order.OrderStatusUpdateRequest;
import com.burgerburst.entity.OrderStatus;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.response.PageResponse;
import com.burgerburst.security.AdminOnly;
import com.burgerburst.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@AdminOnly
@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin Orders")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Search and page all customer orders")
    public ResponseEntity<ApiResponse<PageResponse<AdminOrderResponse>>> list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Orders retrieved", orderService.getAdminOrders(status, search, page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an order with customer information")
    public ResponseEntity<ApiResponse<AdminOrderResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Order retrieved", orderService.getAdminOrder(id)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Move an order through an allowed status transition")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable UUID id, @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Order status updated", orderService.updateStatus(id, request)));
    }
}
