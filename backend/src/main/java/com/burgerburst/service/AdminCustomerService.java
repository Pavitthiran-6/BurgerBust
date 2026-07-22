package com.burgerburst.service;

import com.burgerburst.dto.admin.AccountStatusRequest;
import com.burgerburst.dto.admin.AdminCustomerResponse;
import com.burgerburst.entity.Role;
import com.burgerburst.entity.User;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.repository.RefreshTokenRepository;
import com.burgerburst.repository.UserRepository;
import com.burgerburst.response.PageResponse;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Clock;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminCustomerService {

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final Clock clock;

    @Transactional(readOnly = true)
    public PageResponse<AdminCustomerResponse> search(String search, Boolean active, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        String normalized = search == null || search.isBlank()
                ? null : "%" + search.strip().toLowerCase(Locale.ROOT) + "%";
        String activeSql = active == null ? "" : " and u.is_active = ? ";
        String searchSql = normalized == null ? "" : " and (lower(u.full_name) like ? or lower(u.email) like ?) ";
        String conditions = " where u.deleted_at is null and u.role = 'ROLE_CUSTOMER' " + activeSql + searchSql;

        List<Object> parameters = new java.util.ArrayList<>();
        if (active != null) parameters.add(active);
        if (normalized != null) {
            parameters.add(normalized);
            parameters.add(normalized);
        }
        Long totalValue = jdbcTemplate.queryForObject(
                "select count(*) from app_users u" + conditions, Long.class, parameters.toArray());
        long total = totalValue == null ? 0 : totalValue;
        parameters.add(safeSize);
        parameters.add(safePage * safeSize);

        List<AdminCustomerResponse> content = jdbcTemplate.query("""
                select u.uuid, u.full_name, u.email, u.phone, u.is_verified, u.is_active,
                       u.last_login_at, u.created_at,
                       (select count(*) from orders o where o.user_id = u.id and o.deleted_at is null) orders_count,
                       (select coalesce(sum(o.total),0) from orders o
                           where o.user_id = u.id and o.deleted_at is null and o.status = 'DELIVERED') total_spent,
                       coalesce((select ra.balance from reward_accounts ra
                           where ra.user_id = u.id and ra.deleted_at is null),0) reward_points,
                       (select count(*) from coupon_redemptions cr
                           where cr.user_id = u.id and cr.deleted_at is null) coupons_used
                from app_users u
                """ + conditions + " order by u.created_at desc limit ? offset ?",
                (rs, row) -> new AdminCustomerResponse(
                        rs.getObject("uuid", UUID.class), rs.getString("full_name"), rs.getString("email"),
                        rs.getString("phone"), rs.getBoolean("is_verified"), rs.getBoolean("is_active"),
                        rs.getLong("orders_count"), rs.getBigDecimal("total_spent"),
                        rs.getInt("reward_points"), rs.getLong("coupons_used"),
                        rs.getTimestamp("last_login_at") == null ? null : rs.getTimestamp("last_login_at").toInstant(),
                        rs.getTimestamp("created_at").toInstant()),
                parameters.toArray());
        int totalPages = safeSize == 0 ? 0 : (int) Math.ceil((double) total / safeSize);
        return new PageResponse<>(content, safePage, safeSize, total, totalPages,
                safePage == 0, totalPages == 0 || safePage >= totalPages - 1);
    }

    @Transactional
    public AdminCustomerResponse setStatus(UUID customerUuid, AccountStatusRequest request) {
        User user = userRepository.findByUuidAndDeletedAtIsNull(customerUuid)
                .filter(value -> value.getRole() == Role.ROLE_CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        user.setActive(request.active());
        userRepository.save(user);
        if (!request.active()) {
            refreshTokenRepository.revokeAllActiveByUserUuid(user.getUuid(), clock.instant());
        }
        return findOne(customerUuid);
    }

    @Transactional(readOnly = true)
    public AdminCustomerResponse findOne(UUID customerUuid) {
        List<AdminCustomerResponse> result = jdbcTemplate.query("""
                select u.uuid, u.full_name, u.email, u.phone, u.is_verified, u.is_active,
                       u.last_login_at, u.created_at,
                       (select count(*) from orders o where o.user_id = u.id and o.deleted_at is null) orders_count,
                       (select coalesce(sum(o.total),0) from orders o
                           where o.user_id = u.id and o.deleted_at is null and o.status = 'DELIVERED') total_spent,
                       coalesce((select ra.balance from reward_accounts ra
                           where ra.user_id = u.id and ra.deleted_at is null),0) reward_points,
                       (select count(*) from coupon_redemptions cr
                           where cr.user_id = u.id and cr.deleted_at is null) coupons_used
                from app_users u
                where u.uuid = ? and u.deleted_at is null and u.role = 'ROLE_CUSTOMER'
                """, (rs, row) -> new AdminCustomerResponse(
                rs.getObject("uuid", UUID.class), rs.getString("full_name"), rs.getString("email"),
                rs.getString("phone"), rs.getBoolean("is_verified"), rs.getBoolean("is_active"),
                rs.getLong("orders_count"), rs.getBigDecimal("total_spent"),
                rs.getInt("reward_points"), rs.getLong("coupons_used"),
                rs.getTimestamp("last_login_at") == null ? null : rs.getTimestamp("last_login_at").toInstant(),
                rs.getTimestamp("created_at").toInstant()), customerUuid);
        if (result.isEmpty()) throw new ResourceNotFoundException("Customer not found");
        return result.getFirst();
    }
}
