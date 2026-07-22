package com.burgerburst.service;

import com.burgerburst.dto.admin.BroadcastNotificationRequest;
import com.burgerburst.dto.admin.BroadcastNotificationResponse;
import com.burgerburst.response.PageResponse;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminNotificationService {

    private final JdbcTemplate jdbcTemplate;
    private final Clock clock;

    @Transactional
    public BroadcastNotificationResponse broadcast(
            UUID adminUuid, BroadcastNotificationRequest request) {
        Instant now = clock.instant();
        UUID broadcastUuid = UUID.randomUUID();
        List<Long> recipientIds = jdbcTemplate.queryForList("""
                select id from app_users
                where deleted_at is null and role = 'ROLE_CUSTOMER' and is_active = true
                order by id
                """, Long.class);
        jdbcTemplate.update("""
                insert into admin_broadcasts (
                    uuid, category, title, message, recipient_count, created_by, created_at, updated_at)
                values (?, ?, ?, ?, ?, ?, ?, ?)
                """, broadcastUuid, request.category().name(), request.title().strip(), request.message().strip(),
                recipientIds.size(), adminUuid, Timestamp.from(now), Timestamp.from(now));

        jdbcTemplate.batchUpdate("""
                insert into notifications (
                    uuid, user_id, notification_type, title, message, created_at, updated_at)
                values (?, ?, 'BROADCAST', ?, ?, ?, ?)
                """, recipientIds, Math.min(recipientIds.size(), 500), (statement, userId) -> {
            statement.setObject(1, UUID.randomUUID());
            statement.setLong(2, userId);
            statement.setString(3, request.title().strip());
            statement.setString(4, request.message().strip());
            statement.setTimestamp(5, Timestamp.from(now));
            statement.setTimestamp(6, Timestamp.from(now));
        });
        return new BroadcastNotificationResponse(
                broadcastUuid, request.category().name(), request.title().strip(), request.message().strip(),
                recipientIds.size(), adminUuid, now);
    }

    @Transactional(readOnly = true)
    public PageResponse<BroadcastNotificationResponse> history(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Long totalValue = jdbcTemplate.queryForObject(
                "select count(*) from admin_broadcasts where deleted_at is null", Long.class);
        long total = totalValue == null ? 0 : totalValue;
        List<BroadcastNotificationResponse> content = jdbcTemplate.query("""
                select uuid, category, title, message, recipient_count, created_by, created_at
                from admin_broadcasts where deleted_at is null
                order by created_at desc limit ? offset ?
                """, (rs, row) -> new BroadcastNotificationResponse(
                rs.getObject("uuid", UUID.class), rs.getString("category"), rs.getString("title"),
                rs.getString("message"), rs.getInt("recipient_count"),
                rs.getObject("created_by", UUID.class), rs.getTimestamp("created_at").toInstant()),
                safeSize, safePage * safeSize);
        int totalPages = (int) Math.ceil((double) total / safeSize);
        return new PageResponse<>(content, safePage, safeSize, total, totalPages,
                safePage == 0, totalPages == 0 || safePage >= totalPages - 1);
    }
}
