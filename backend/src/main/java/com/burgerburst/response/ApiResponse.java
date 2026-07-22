package com.burgerburst.response;

import java.time.Instant;
import java.util.List;

public record ApiResponse<T>(
        boolean success,
        String message,
        Instant timestamp,
        T data,
        List<ApiError> errors) {

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, Instant.now(), data, List.of());
    }

    public static ApiResponse<Void> failure(String message, List<ApiError> errors) {
        return new ApiResponse<>(false, message, Instant.now(), null, List.copyOf(errors));
    }

    public static ApiResponse<Void> failure(String message) {
        return failure(message, List.of());
    }
}
