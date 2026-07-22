package com.burgerburst.service;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuditService {

    private final JdbcTemplate jdbcTemplate;
    private final Clock clock;

    public void record(
            UUID actorUuid, String actorEmail, String method, String path,
            String outcome, String detail, String requestId, long durationMs) {
        try {
            Instant now = clock.instant();
            jdbcTemplate.update("""
                    insert into admin_audit_events (
                        uuid, actor_uuid, actor_email, http_method, request_path, outcome,
                        detail, request_id, duration_ms, created_at, updated_at)
                    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, UUID.randomUUID(), actorUuid, truncate(actorEmail, 320), truncate(method, 10),
                    truncate(path, 500), outcome, truncate(detail, 500), truncate(requestId, 100),
                    Math.max(durationMs, 0), Timestamp.from(now), Timestamp.from(now));
        } catch (RuntimeException exception) {
            log.error("Unable to persist admin audit event path={} outcome={}", path, outcome, exception);
        }
    }

    private String truncate(String value, int max) {
        return value == null || value.length() <= max ? value : value.substring(0, max);
    }
}
