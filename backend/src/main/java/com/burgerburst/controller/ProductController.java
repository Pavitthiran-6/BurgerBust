package com.burgerburst.controller;

import com.burgerburst.dto.product.ProductResponse;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.response.PageResponse;
import com.burgerburst.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get paginated public products with filters and sorting")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getProducts(
            @RequestParam(required = false) UUID category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean veg,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean recommended,
            @RequestParam(required = false) Boolean popular,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        return pageResponse(productService.getProducts(
                null, category, minPrice, maxPrice, veg, featured, recommended, popular,
                page, size, sort, direction));
    }

    @GetMapping("/search")
    @Operation(summary = "Search products by name or description")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> search(
            @RequestParam String q,
            @RequestParam(required = false) UUID category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean veg,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "rating") String sort,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        return pageResponse(productService.getProducts(
                q, category, minPrice, maxPrice, veg, null, null, null,
                page, size, sort, direction));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> featured() {
        return listResponse("Featured products retrieved", productService.getHighlighted("featured"));
    }

    @GetMapping("/recommended")
    @Operation(summary = "Get recommended products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> recommended() {
        return listResponse("Recommended products retrieved", productService.getHighlighted("recommended"));
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> popular() {
        return listResponse("Popular products retrieved", productService.getHighlighted("popular"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get public product details")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(@PathVariable("id") UUID uuid) {
        return ResponseEntity.ok(ApiResponse.success("Product retrieved", productService.getProduct(uuid)));
    }

    private ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> pageResponse(
            PageResponse<ProductResponse> page) {
        return ResponseEntity.ok(ApiResponse.success("Products retrieved", page));
    }

    private ResponseEntity<ApiResponse<List<ProductResponse>>> listResponse(
            String message, List<ProductResponse> products) {
        return ResponseEntity.ok(ApiResponse.success(message, products));
    }
}
