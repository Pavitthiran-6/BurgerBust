package com.burgerburst.dto.restaurant;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;

public record OperatingHoursRequest(
        @NotNull DayOfWeek dayOfWeek,
        LocalTime openTime,
        LocalTime closeTime,
        boolean closed) {

    @AssertTrue(message = "Open and close times are required for an operating day")
    public boolean isScheduleValid() {
        return closed
                ? openTime == null && closeTime == null
                : openTime != null && closeTime != null && !openTime.equals(closeTime);
    }
}
