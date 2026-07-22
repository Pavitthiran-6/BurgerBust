package com.burgerburst.service;

import com.burgerburst.dto.admin.AnalyticsEventRequest;
import com.burgerburst.entity.AnalyticsEventType;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.EnumSet;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnalyticsEventService {

    private static final EnumSet<AnalyticsEventType> PRODUCT_EVENTS = EnumSet.of(
            AnalyticsEventType.PRODUCT_VIEWED, AnalyticsEventType.ADDED_TO_CART,
            AnalyticsEventType.REMOVED_FROM_CART, AnalyticsEventType.REVIEW_SUBMITTED);

    private final JdbcTemplate jdbcTemplate;
    private final Clock clock;

    @Transactional
    public void record(AnalyticsEventRequest request, UUID userUuid) {
        if (PRODUCT_EVENTS.contains(request.eventType()) && request.productId() == null) {
            throw new IllegalArgumentException("Product ID is required for this analytics event");
        }
        Instant now = clock.instant();
        jdbcTemplate.update("""
                insert into analytics_events (
                    uuid, session_id, user_id, event_type, product_uuid,
                    occurred_at, created_at, updated_at)
                values (?, ?, (select id from app_users where uuid = ? and deleted_at is null), ?, ?, ?, ?, ?)
                """,
                UUID.randomUUID(), request.sessionId(), userUuid, request.eventType().name(), request.productId(),
                Timestamp.from(now), Timestamp.from(now), Timestamp.from(now));
    }
}
