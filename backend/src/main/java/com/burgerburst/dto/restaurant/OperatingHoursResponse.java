package com.burgerburst.dto.restaurant;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record OperatingHoursResponse(
        DayOfWeek dayOfWeek,
        LocalTime openTime,
        LocalTime closeTime,
        boolean closed) {
}
