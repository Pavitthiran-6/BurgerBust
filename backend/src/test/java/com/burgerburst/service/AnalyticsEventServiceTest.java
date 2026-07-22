package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.burgerburst.dto.admin.AnalyticsEventRequest;
import com.burgerburst.entity.AnalyticsEventType;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

@ExtendWith(MockitoExtension.class)
class AnalyticsEventServiceTest {

    @Mock private JdbcTemplate jdbcTemplate;
    private final Clock clock = Clock.fixed(Instant.parse("2026-07-21T10:00:00Z"), ZoneOffset.UTC);

    @Test
    void recordsWhitelistedFunnelEventWithoutSensitiveMetadata() {
        AnalyticsEventService service = new AnalyticsEventService(jdbcTemplate, clock);
        UUID productId = UUID.randomUUID();

        service.record(new AnalyticsEventRequest(
                UUID.randomUUID(), AnalyticsEventType.PRODUCT_VIEWED, productId), UUID.randomUUID());

        verify(jdbcTemplate).update(contains("insert into analytics_events"),
                any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void rejectsProductEventsWithoutAProductId() {
        AnalyticsEventService service = new AnalyticsEventService(jdbcTemplate, clock);

        assertThatThrownBy(() -> service.record(new AnalyticsEventRequest(
                UUID.randomUUID(), AnalyticsEventType.ADDED_TO_CART, null), null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Product ID is required");
        verify(jdbcTemplate, never()).update(any(String.class), any(Object[].class));
    }
}
