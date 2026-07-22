package com.burgerburst.controller;

import com.burgerburst.dto.inventory.InventoryResponse;
import com.burgerburst.dto.inventory.InventoryUpdateRequest;
import com.burgerburst.dto.inventory.StockUpdateRequest;
import com.burgerburst.dto.admin.StockAdjustmentRequest;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.security.AdminOnly;
import com.burgerburst.security.UserPrincipal;
import com.burgerburst.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AdminOnly
@RestController
@RequestMapping("/api/v1/admin/inventory")
@RequiredArgsConstructor
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @Operation(summary = "Get product inventory and stock alerts")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getInventory() {
        return ResponseEntity.ok(ApiResponse.success("Inventory retrieved", inventoryService.getInventory()));
    }

    @PutMapping("/{productId}")
    @Operation(summary = "Update inventory settings and stock")
    public ResponseEntity<ApiResponse<InventoryResponse>> update(
            @PathVariable UUID productId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InventoryUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Inventory updated", inventoryService.update(productId, request, principal.uuid())));
    }

    @PatchMapping("/{productId}/stock")
    @Operation(summary = "Set current product stock quantity")
    public ResponseEntity<ApiResponse<InventoryResponse>> setStock(
            @PathVariable UUID productId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Stock updated", inventoryService.setStock(productId, request, principal.uuid())));
    }

    @PatchMapping("/{productId}/adjust")
    @Operation(summary = "Atomically adjust stock by a positive or negative quantity")
    public ResponseEntity<ApiResponse<InventoryResponse>> adjust(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID productId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Inventory adjusted", inventoryService.adjust(productId, request, principal.uuid())));
    }
}
