package com.burgerburst.controller;

import com.burgerburst.dto.product.ProductRequest;
import com.burgerburst.dto.product.ProductResponse;
import com.burgerburst.dto.admin.BulkProductDeleteRequest;
import com.burgerburst.dto.admin.BulkProductUpdateRequest;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.response.PageResponse;
import com.burgerburst.security.AdminOnly;
import com.burgerburst.security.UserPrincipal;
import com.burgerburst.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import java.util.UUID;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@AdminOnly
@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Search all non-deleted products including unavailable products")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Products retrieved", productService.getAdminProducts(search, page, size)));
    }

    @PostMapping
    @Operation(summary = "Create a product and its inventory record")
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created", productService.create(request, principal.uuid())));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a product")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable("id") UUID uuid,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.update(uuid, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a product")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") UUID uuid) {
        productService.softDelete(uuid);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore a soft-deleted product")
    public ResponseEntity<ApiResponse<ProductResponse>> restore(@PathVariable("id") UUID uuid) {
        return ResponseEntity.ok(ApiResponse.success("Product restored", productService.restore(uuid)));
    }

    @PatchMapping("/bulk")
    @Operation(summary = "Bulk update product availability, visibility, merchandising, or category")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> bulkUpdate(
            @Valid @RequestBody BulkProductUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Products updated", productService.bulkUpdate(request)));
    }

    @DeleteMapping("/bulk")
    @Operation(summary = "Soft delete up to 200 products")
    public ResponseEntity<ApiResponse<Integer>> bulkDelete(
            @Valid @RequestBody BulkProductDeleteRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Products deleted", productService.bulkDelete(request)));
    }
}
