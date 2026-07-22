package com.burgerburst.controller;

import com.burgerburst.dto.admin.AccountStatusRequest;
import com.burgerburst.dto.admin.AdminCustomerResponse;
import com.burgerburst.dto.admin.AdminOrderResponse;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.response.PageResponse;
import com.burgerburst.security.AdminOnly;
import com.burgerburst.service.AdminCustomerService;
import com.burgerburst.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@AdminOnly
@RestController
@RequestMapping("/api/v1/admin/customers")
@RequiredArgsConstructor
@Tag(name = "Admin Customers")
public class AdminCustomerController {

    private final AdminCustomerService customerService;
    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Search and page customers with commerce totals")
    public ResponseEntity<ApiResponse<PageResponse<AdminCustomerResponse>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Customers retrieved", customerService.search(search, active, page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a customer summary")
    public ResponseEntity<ApiResponse<AdminCustomerResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Customer retrieved", customerService.findOne(id)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Suspend or activate a customer; suspension revokes all refresh tokens")
    public ResponseEntity<ApiResponse<AdminCustomerResponse>> status(
            @PathVariable UUID id, @Valid @RequestBody AccountStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                request.active() ? "Customer activated" : "Customer suspended",
                customerService.setStatus(id, request)));
    }

    @GetMapping("/{id}/orders")
    @Operation(summary = "Get a customer's order history")
    public ResponseEntity<ApiResponse<PageResponse<AdminOrderResponse>>> orders(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        customerService.findOne(id);
        return ResponseEntity.ok(ApiResponse.success(
                "Customer orders retrieved", orderService.getAdminCustomerOrders(id, page, size)));
    }
}
