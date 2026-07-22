package com.burgerburst.controller;

import com.burgerburst.dto.review.ReviewResponse;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.response.PageResponse;
import com.burgerburst.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products/{productId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Product Reviews")
public class ProductReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get paginated public product reviews")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getReviews(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Reviews retrieved", reviewService.getProductReviews(productId, page, size)));
    }
}
