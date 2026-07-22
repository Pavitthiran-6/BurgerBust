package com.burgerburst.controller;

import com.burgerburst.dto.review.ReviewRequest;
import com.burgerburst.dto.review.ReviewResponse;
import com.burgerburst.dto.review.UpdateReviewRequest;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.security.AuthenticatedUser;
import com.burgerburst.security.UserPrincipal;
import com.burgerburst.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AuthenticatedUser
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Review a delivered order, product, or restaurant")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Review created", reviewService.create(principal.uuid(), request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edit a customer-owned review")
    public ResponseEntity<ApiResponse<ReviewResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Review updated", reviewService.update(principal.uuid(), id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a customer-owned review")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        reviewService.delete(principal.uuid(), id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}

