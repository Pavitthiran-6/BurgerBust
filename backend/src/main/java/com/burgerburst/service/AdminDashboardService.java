package com.burgerburst.service;

import com.burgerburst.dto.admin.AdminAnalyticsResponse;
import com.burgerburst.dto.admin.AdminDashboardResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private static final String RECOGNIZED_ORDER = "status = 'DELIVERED' and deleted_at is null";

    private final JdbcTemplate jdbcTemplate;
    private final Clock clock;

    @Transactional(readOnly = true)
    public AdminDashboardResponse dashboard() {
        Instant now = clock.instant();
        LocalDate today = now.atZone(ZoneOffset.UTC).toLocalDate();
        Instant dayStart = today.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant weekStart = today.with(java.time.DayOfWeek.MONDAY).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant monthStart = today.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay(ZoneOffset.UTC).toInstant();

        BigDecimal totalRevenue = money("select coalesce(sum(total), 0) from orders where " + RECOGNIZED_ORDER);
        BigDecimal todayRevenue = revenueSince(dayStart);
        BigDecimal weekRevenue = revenueSince(weekStart);
        BigDecimal monthRevenue = revenueSince(monthStart);
        long delivered = count("select count(*) from orders where " + RECOGNIZED_ORDER);
        BigDecimal average = delivered == 0 ? BigDecimal.ZERO
                : totalRevenue.divide(BigDecimal.valueOf(delivered), 2, RoundingMode.HALF_UP);

        long totalOrders = count("select count(*) from orders where deleted_at is null");
        long todayOrders = countSince("select count(*) from orders where deleted_at is null and created_at >= ?", dayStart);
        long pending = count("""
                select count(*) from orders
                where deleted_at is null and status in ('PLACED','CONFIRMED','PREPARING','READY','OUT_FOR_DELIVERY')
                """);
        long cancelled = count("select count(*) from orders where deleted_at is null and status = 'CANCELLED'");
        long activeCustomers = count("""
                select count(*) from app_users
                where deleted_at is null and role = 'ROLE_CUSTOMER' and is_active = true
                """);

        return new AdminDashboardResponse(
                new AdminDashboardResponse.RevenueSummary(
                        totalRevenue, todayRevenue, weekRevenue, monthRevenue, average),
                new AdminDashboardResponse.OrderSummary(totalOrders, todayOrders, pending, delivered, cancelled),
                activeCustomers,
                salesSeries("day", now.minus(Duration.ofDays(13)), now),
                salesSeries("week", now.minus(Duration.ofDays(7L * 11)), now),
                salesSeries("month", now.minus(Duration.ofDays(365)), now),
                topProducts(dayStart.minus(Duration.ofDays(365)), now, 10),
                lowStock(),
                pendingOrders(),
                statusDistribution(),
                reviewSummary(),
                couponSummary(),
                rewardStatistics(),
                recentAudit());
    }

    @Transactional(readOnly = true)
    public AdminAnalyticsResponse analytics(Instant from, Instant to) {
        validateRange(from, to);
        Duration duration = Duration.between(from, to);
        String bucket = duration.toDays() <= 2 ? "hour" : duration.toDays() <= 120 ? "day" : "month";
        BigDecimal revenue = moneyBetween("select coalesce(sum(total), 0) from orders where "
                + RECOGNIZED_ORDER + " and created_at >= ? and created_at < ?", from, to);
        long orders = countBetween("select count(*) from orders where deleted_at is null and created_at >= ? and created_at < ?", from, to);
        BigDecimal average = orders == 0 ? BigDecimal.ZERO
                : revenue.divide(BigDecimal.valueOf(orders), 2, RoundingMode.HALF_UP);

        return new AdminAnalyticsResponse(
                from, to, revenue, orders, average,
                salesSeries(bucket, from, to),
                topProducts(from, to, 20),
                peakHours(from, to),
                customerGrowth(from, to),
                funnel(from, to),
                categoryPerformance(from, to));
    }

    private BigDecimal revenueSince(Instant instant) {
        return moneySince("select coalesce(sum(total), 0) from orders where "
                + RECOGNIZED_ORDER + " and created_at >= ?", instant);
    }

    private List<AdminDashboardResponse.SalesPoint> salesSeries(String bucket, Instant from, Instant to) {
        String format = switch (bucket) {
            case "hour" -> "YYYY-MM-DD HH24:00";
            case "week" -> "IYYY-\"W\"IW";
            case "month" -> "YYYY-MM";
            default -> "YYYY-MM-DD";
        };
        String sql = "select to_char(date_trunc('" + bucket + "', created_at at time zone 'UTC'), '" + format
                + "') period, coalesce(sum(total),0) revenue, count(*) orders "
                + "from orders where " + RECOGNIZED_ORDER + " and created_at >= ? and created_at < ? "
                + "group by 1 order by 1";
        return jdbcTemplate.query(sql, (rs, row) -> new AdminDashboardResponse.SalesPoint(
                rs.getString("period"), rs.getBigDecimal("revenue"), rs.getLong("orders")),
                Timestamp.from(from), Timestamp.from(to));
    }

    private List<AdminDashboardResponse.ProductMetric> topProducts(Instant from, Instant to, int limit) {
        return jdbcTemplate.query("""
                select oi.product_uuid, oi.product_name, sum(oi.quantity) quantity,
                       coalesce(sum(oi.line_total), 0) revenue
                from order_items oi join orders o on o.id = oi.order_id
                where oi.deleted_at is null and o.deleted_at is null and o.status = 'DELIVERED'
                  and o.created_at >= ? and o.created_at < ?
                group by oi.product_uuid, oi.product_name
                order by quantity desc, revenue desc
                limit ?
                """, (rs, row) -> new AdminDashboardResponse.ProductMetric(
                uuid(rs, "product_uuid"), rs.getString("product_name"),
                rs.getLong("quantity"), rs.getBigDecimal("revenue")),
                Timestamp.from(from), Timestamp.from(to), limit);
    }

    private List<AdminDashboardResponse.LowStockMetric> lowStock() {
        return jdbcTemplate.query("""
                select p.uuid, p.name, i.stock_quantity, i.low_stock_threshold
                from inventory i join products p on p.id = i.product_id
                where i.deleted_at is null and p.deleted_at is null
                  and i.stock_quantity <= i.low_stock_threshold
                order by i.stock_quantity asc, p.name asc limit 20
                """, (rs, row) -> new AdminDashboardResponse.LowStockMetric(
                uuid(rs, "uuid"), rs.getString("name"), rs.getInt("stock_quantity"),
                rs.getInt("low_stock_threshold"), rs.getInt("stock_quantity") == 0));
    }

    private List<AdminDashboardResponse.PendingOrderMetric> pendingOrders() {
        return jdbcTemplate.query("""
                select o.uuid, o.order_number, u.full_name, o.status, o.total, o.currency, o.placed_at
                from orders o join app_users u on u.id = o.user_id
                where o.deleted_at is null
                  and o.status in ('PLACED','CONFIRMED','PREPARING','READY','OUT_FOR_DELIVERY')
                order by o.placed_at asc limit 20
                """, (rs, row) -> new AdminDashboardResponse.PendingOrderMetric(
                uuid(rs, "uuid"), rs.getString("order_number"), rs.getString("full_name"),
                rs.getString("status"), rs.getBigDecimal("total"), rs.getString("currency"),
                rs.getTimestamp("placed_at").toInstant()));
    }

    private Map<String, Long> statusDistribution() {
        Map<String, Long> result = new LinkedHashMap<>();
        jdbcTemplate.query("""
                select status, count(*) count from orders
                where deleted_at is null group by status order by status
                """, (RowCallbackHandler) rs -> result.put(rs.getString("status"), rs.getLong("count")));
        return result;
    }

    private AdminDashboardResponse.ReviewSummary reviewSummary() {
        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int rating = 1; rating <= 5; rating++) distribution.put(rating, 0L);
        jdbcTemplate.query("""
                select rating, count(*) count from reviews
                where deleted_at is null group by rating order by rating
                """, (RowCallbackHandler) rs -> distribution.put(rs.getInt("rating"), rs.getLong("count")));
        BigDecimal average = jdbcTemplate.queryForObject("""
                select coalesce(avg(rating), 0) from reviews where deleted_at is null
                """, BigDecimal.class);
        long total = distribution.values().stream().mapToLong(Long::longValue).sum();
        return new AdminDashboardResponse.ReviewSummary(scale(average), total, distribution);
    }

    private AdminDashboardResponse.CouponSummary couponSummary() {
        long redemptions = count("select count(*) from coupon_redemptions where deleted_at is null");
        BigDecimal discount = money("select coalesce(sum(discount_amount),0) from coupon_redemptions where deleted_at is null");
        List<String> codes = jdbcTemplate.query("""
                select c.code from coupon_redemptions cr join coupons c on c.id = cr.coupon_id
                where cr.deleted_at is null group by c.code order by count(*) desc, c.code limit 1
                """, (rs, row) -> rs.getString(1));
        return new AdminDashboardResponse.CouponSummary(
                redemptions, discount, codes.isEmpty() ? null : codes.getFirst());
    }

    private AdminDashboardResponse.RewardStatistics rewardStatistics() {
        Map<String, Object> row = jdbcTemplate.queryForMap("""
                select coalesce(sum(balance),0) outstanding,
                       coalesce(sum(total_earned),0) issued,
                       coalesce(sum(total_redeemed),0) redeemed,
                       count(*) active_accounts
                from reward_accounts where deleted_at is null
                """);
        return new AdminDashboardResponse.RewardStatistics(
                ((Number) row.get("outstanding")).longValue(), ((Number) row.get("issued")).longValue(),
                ((Number) row.get("redeemed")).longValue(), ((Number) row.get("active_accounts")).longValue());
    }

    private List<AdminDashboardResponse.AuditEntry> recentAudit() {
        return jdbcTemplate.query("""
                select uuid, actor_uuid, actor_email, http_method, request_path, outcome,
                       detail, request_id, duration_ms, created_at
                from admin_audit_events where deleted_at is null
                order by created_at desc limit 20
                """, (rs, row) -> new AdminDashboardResponse.AuditEntry(
                uuid(rs, "uuid"), nullableUuid(rs, "actor_uuid"), rs.getString("actor_email"),
                rs.getString("http_method"), rs.getString("request_path"), rs.getString("outcome"),
                rs.getString("detail"), rs.getString("request_id"), rs.getLong("duration_ms"),
                rs.getTimestamp("created_at").toInstant()));
    }

    private List<AdminAnalyticsResponse.PeakHour> peakHours(Instant from, Instant to) {
        return jdbcTemplate.query("""
                select extract(hour from created_at at time zone 'UTC')::int hour_of_day,
                       count(*) order_count, coalesce(sum(total),0) revenue
                from orders where deleted_at is null and created_at >= ? and created_at < ?
                group by 1 order by order_count desc, hour_of_day asc
                """, (rs, row) -> new AdminAnalyticsResponse.PeakHour(
                rs.getInt("hour_of_day"), rs.getLong("order_count"), rs.getBigDecimal("revenue")),
                Timestamp.from(from), Timestamp.from(to));
    }

    private List<AdminAnalyticsResponse.CustomerGrowth> customerGrowth(Instant from, Instant to) {
        return jdbcTemplate.query("""
                select (created_at at time zone 'UTC')::date as growth_date, count(*) customer_count
                from app_users where deleted_at is null and role = 'ROLE_CUSTOMER'
                  and created_at >= ? and created_at < ?
                group by 1 order by 1
                """, (rs, row) -> new AdminAnalyticsResponse.CustomerGrowth(
                rs.getObject("growth_date", LocalDate.class), rs.getLong("customer_count")),
                Timestamp.from(from), Timestamp.from(to));
    }

    private AdminAnalyticsResponse.FunnelMetrics funnel(Instant from, Instant to) {
        Map<String, Object> row = jdbcTemplate.queryForMap("""
                select count(distinct session_id) visitors,
                       count(distinct session_id) filter (where event_type = 'PRODUCT_VIEWED') product_viewers,
                       count(distinct session_id) filter (where event_type = 'ADDED_TO_CART') cart_sessions,
                       count(distinct session_id) filter (where event_type = 'CHECKOUT_STARTED') checkout_sessions,
                       count(distinct session_id) filter (where event_type = 'ORDER_PLACED') ordering_sessions
                from analytics_events
                where deleted_at is null and occurred_at >= ? and occurred_at < ?
                """, Timestamp.from(from), Timestamp.from(to));
        long visitors = ((Number) row.get("visitors")).longValue();
        long viewers = ((Number) row.get("product_viewers")).longValue();
        long carts = ((Number) row.get("cart_sessions")).longValue();
        long checkouts = ((Number) row.get("checkout_sessions")).longValue();
        long ordering = ((Number) row.get("ordering_sessions")).longValue();
        return new AdminAnalyticsResponse.FunnelMetrics(
                visitors, viewers, carts, checkouts, ordering,
                rate(carts, viewers), rate(checkouts, carts), rate(ordering, checkouts));
    }

    private List<AdminAnalyticsResponse.CategoryPerformance> categoryPerformance(Instant from, Instant to) {
        return jdbcTemplate.query("""
                select coalesce(c.name, 'Deleted product') category, sum(oi.quantity) quantity,
                       coalesce(sum(oi.line_total),0) revenue
                from order_items oi join orders o on o.id = oi.order_id
                left join products p on p.uuid = oi.product_uuid
                left join categories c on c.id = p.category_id
                where oi.deleted_at is null and o.deleted_at is null and o.status = 'DELIVERED'
                  and o.created_at >= ? and o.created_at < ?
                group by c.name order by revenue desc
                """, (rs, row) -> new AdminAnalyticsResponse.CategoryPerformance(
                rs.getString("category"), rs.getLong("quantity"), rs.getBigDecimal("revenue")),
                Timestamp.from(from), Timestamp.from(to));
    }

    private void validateRange(Instant from, Instant to) {
        if (from == null || to == null || !from.isBefore(to)) {
            throw new IllegalArgumentException("Report start must be before report end");
        }
        if (Duration.between(from, to).toDays() > 731) {
            throw new IllegalArgumentException("Analytics range cannot exceed two years");
        }
    }

    private BigDecimal rate(long numerator, long denominator) {
        if (denominator == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(numerator).multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(denominator), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal money(String sql) {
        return scale(jdbcTemplate.queryForObject(sql, BigDecimal.class));
    }

    private BigDecimal moneySince(String sql, Instant instant) {
        return scale(jdbcTemplate.queryForObject(sql, BigDecimal.class, Timestamp.from(instant)));
    }

    private BigDecimal moneyBetween(String sql, Instant from, Instant to) {
        return scale(jdbcTemplate.queryForObject(sql, BigDecimal.class, Timestamp.from(from), Timestamp.from(to)));
    }

    private long count(String sql) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class);
        return value == null ? 0 : value;
    }

    private long countSince(String sql, Instant instant) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class, Timestamp.from(instant));
        return value == null ? 0 : value;
    }

    private long countBetween(String sql, Instant from, Instant to) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class, Timestamp.from(from), Timestamp.from(to));
        return value == null ? 0 : value;
    }

    private BigDecimal scale(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP);
    }

    private UUID uuid(ResultSet resultSet, String column) throws SQLException {
        return resultSet.getObject(column, UUID.class);
    }

    private UUID nullableUuid(ResultSet resultSet, String column) throws SQLException {
        return resultSet.getObject(column, UUID.class);
    }
}
