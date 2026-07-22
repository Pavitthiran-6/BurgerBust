package com.burgerburst.controller;

import com.burgerburst.dto.address.AddressRequest;
import com.burgerburst.dto.address.AddressResponse;
import com.burgerburst.response.ApiResponse;
import com.burgerburst.security.AuthenticatedUser;
import com.burgerburst.security.UserPrincipal;
import com.burgerburst.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AuthenticatedUser
@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
@Tag(name = "Delivery Addresses")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "List the current user's saved delivery addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Delivery addresses retrieved", addressService.list(principal.uuid())));
    }

    @PostMapping
    @Operation(summary = "Save a delivery address for the current user")
    public ResponseEntity<ApiResponse<AddressResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Delivery address saved", addressService.create(principal.uuid(), request)));
    }

    @PatchMapping("/{id}/default")
    @Operation(summary = "Set a saved delivery address as the default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefault(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID addressUuid) {
        return ResponseEntity.ok(ApiResponse.success(
                "Default delivery address updated", addressService.setDefault(principal.uuid(), addressUuid)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a saved delivery address")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID addressUuid) {
        addressService.delete(principal.uuid(), addressUuid);
        return ResponseEntity.ok(ApiResponse.success("Delivery address deleted", null));
    }
}
