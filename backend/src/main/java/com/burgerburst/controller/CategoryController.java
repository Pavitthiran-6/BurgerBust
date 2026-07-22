package com.burgerburst.controller;

import com.burgerburst.dto.category.CategoryResponse;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get active menu categories in display order")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved", categoryService.getPublicCategories()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an active menu category")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategory(@PathVariable("id") UUID uuid) {
        return ResponseEntity.ok(ApiResponse.success("Category retrieved", categoryService.getPublicCategory(uuid)));
    }
}
