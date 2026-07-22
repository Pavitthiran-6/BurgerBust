package com.burgerburst.dto.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddressRequest(
        @NotBlank @Size(max = 60) String label,
        @NotBlank @Pattern(regexp = "HOME BASE|WORK BASE|FRIENDS BASE|SECRET DEN") String tag,
        @NotBlank @Size(max = 120) String recipientName,
        @NotBlank @Pattern(regexp = "^[+0-9][0-9 ()-]{6,19}$") String phone,
        @NotBlank @Size(max = 200) String addressLine1,
        @Size(max = 200) String addressLine2,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Size(max = 100) String state,
        @NotBlank @Pattern(regexp = "^[A-Za-z0-9 -]{3,12}$") String postalCode,
        @Size(max = 500) String deliveryInstructions,
        boolean defaultAddress) {
}
