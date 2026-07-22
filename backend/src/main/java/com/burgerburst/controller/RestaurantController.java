package com.burgerburst.controller;

import com.burgerburst.dto.restaurant.RestaurantResponse;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.service.RestaurantService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/restaurant")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping
    @Operation(summary = "Get public restaurant information and availability")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getRestaurant() {
        return ResponseEntity.ok(ApiResponse.success(
                "Restaurant retrieved", restaurantService.getRestaurant()));
    }
}
