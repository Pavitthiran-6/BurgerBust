package com.burgerburst.controller;

import com.burgerburst.dto.restaurant.RestaurantResponse;
import com.burgerburst.dto.restaurant.RestaurantStatusUpdateRequest;
import com.burgerburst.dto.restaurant.RestaurantUpdateRequest;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.security.AdminOnly;
import com.burgerburst.service.RestaurantService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AdminOnly
@RestController
@RequestMapping("/api/v1/admin/restaurant")
@RequiredArgsConstructor
public class AdminRestaurantController {

    private final RestaurantService restaurantService;

    @PutMapping
    @Operation(summary = "Update restaurant settings")
    public ResponseEntity<ApiResponse<RestaurantResponse>> update(
            @Valid @RequestBody RestaurantUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Restaurant updated", restaurantService.update(request)));
    }

    @PatchMapping("/status")
    @Operation(summary = "Update restaurant operational status")
    public ResponseEntity<ApiResponse<RestaurantResponse>> updateStatus(
            @Valid @RequestBody RestaurantStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Restaurant status updated", restaurantService.updateStatus(request)));
    }
}
