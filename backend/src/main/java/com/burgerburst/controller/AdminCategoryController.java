package com.burgerburst.controller;

import com.burgerburst.dto.category.CategoryRequest;
import com.burgerburst.dto.category.CategoryResponse;
import com.burgerburst.dto.category.CategoryStatusRequest;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.security.AdminOnly;
import com.burgerburst.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import java.util.UUID;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AdminOnly
@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "List enabled and disabled categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(
                "Categories retrieved", categoryService.getAdminCategories()));
    }

    @PostMapping
    @Operation(summary = "Create a category")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created", categoryService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @PathVariable("id") UUID uuid,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category updated", categoryService.update(uuid, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a category")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") UUID uuid) {
        categoryService.softDelete(uuid);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Enable or disable a category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateStatus(
            @PathVariable("id") UUID uuid,
            @Valid @RequestBody CategoryStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Category status updated", categoryService.updateStatus(uuid, request.active())));
    }
}
