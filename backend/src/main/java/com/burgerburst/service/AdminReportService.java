package com.burgerburst.service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminReportService {

    private final JdbcTemplate jdbcTemplate;
    private final XlsxReportWriter xlsxWriter;
    private final Clock clock;

    @Transactional(readOnly = true)
    public ReportFile export(ReportType type, ReportFormat format, Instant from, Instant to) {
        validateRange(from, to);
        ReportData data = switch (type) {
            case SALES -> sales(from, to);
            case PRODUCTS -> products(from, to);
            case CUSTOMERS -> customers(from, to);
            case INVENTORY -> inventory();
            case PAYMENTS -> payments(from, to);
        };
        String stamp = DateTimeFormatter.ofPattern("yyyyMMdd-HHmm", Locale.ROOT)
                .withZone(ZoneOffset.UTC).format(clock.instant());
        String base = "burgerburst-" + type.name().toLowerCase(Locale.ROOT) + "-" + stamp;
        if (format == ReportFormat.CSV) {
            return new ReportFile(base + ".csv", "text/csv; charset=UTF-8", csv(data));
        }
        return new ReportFile(
                base + ".xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                xlsxWriter.write(title(type), data.headers(), data.types(), data.rows()));
    }

    private ReportData sales(Instant from, Instant to) {
        List<String> headers = List.of(
                "Order Number", "Placed At", "Customer", "Email", "Status", "Payment Method",
                "Subtotal", "Coupon Discount", "Reward Discount", "Tax", "Delivery Fee", "Total", "Currency");
        List<ColumnType> types = List.of(
                ColumnType.TEXT, ColumnType.DATE_TIME, ColumnType.TEXT, ColumnType.TEXT,
                ColumnType.TEXT, ColumnType.TEXT, ColumnType.CURRENCY, ColumnType.CURRENCY,
                ColumnType.CURRENCY, ColumnType.CURRENCY, ColumnType.CURRENCY, ColumnType.CURRENCY, ColumnType.TEXT);
        List<List<Object>> rows = jdbcTemplate.query("""
                select o.order_number, o.placed_at, u.full_name, u.email, o.status, o.payment_method,
                       o.subtotal, o.coupon_discount, o.reward_discount, o.tax, o.delivery_fee, o.total, o.currency
                from orders o join app_users u on u.id = o.user_id
                where o.deleted_at is null and o.created_at >= ? and o.created_at < ?
                order by o.created_at desc
                """, (rs, row) -> List.of(
                rs.getString("order_number"), rs.getTimestamp("placed_at").toInstant(),
                rs.getString("full_name"), rs.getString("email"), rs.getString("status"),
                rs.getString("payment_method"), rs.getBigDecimal("subtotal"),
                rs.getBigDecimal("coupon_discount"), rs.getBigDecimal("reward_discount"),
                rs.getBigDecimal("tax"), rs.getBigDecimal("delivery_fee"),
                rs.getBigDecimal("total"), rs.getString("currency")),
                Timestamp.from(from), Timestamp.from(to));
        return new ReportData(headers, types, rows);
    }

    private ReportData products(Instant from, Instant to) {
        List<String> headers = List.of(
                "Product ID", "Product", "Category", "Units Sold", "Sales Revenue",
                "Rating", "Review Count", "Available", "Visible");
        List<ColumnType> types = List.of(
                ColumnType.TEXT, ColumnType.TEXT, ColumnType.TEXT, ColumnType.INTEGER, ColumnType.CURRENCY,
                ColumnType.DECIMAL, ColumnType.INTEGER, ColumnType.BOOLEAN, ColumnType.BOOLEAN);
        List<List<Object>> rows = jdbcTemplate.query("""
                select p.uuid, p.name, c.name category,
                       coalesce(sum(oi.quantity) filter (where o.id is not null),0) units_sold,
                       coalesce(sum(oi.line_total) filter (where o.id is not null),0) sales_revenue,
                       p.rating, p.review_count,
                       p.available, p.visible
                from products p join categories c on c.id = p.category_id
                left join order_items oi on oi.product_uuid = p.uuid and oi.deleted_at is null
                left join orders o on o.id = oi.order_id and o.deleted_at is null and o.status = 'DELIVERED'
                    and o.created_at >= ? and o.created_at < ?
                where p.deleted_at is null
                group by p.uuid, p.name, c.name, p.rating, p.review_count, p.available, p.visible
                order by units_sold desc, p.name
                """, (rs, row) -> List.of(
                rs.getObject("uuid"), rs.getString("name"), rs.getString("category"),
                rs.getLong("units_sold"), rs.getBigDecimal("sales_revenue"),
                rs.getBigDecimal("rating"), rs.getLong("review_count"),
                rs.getBoolean("available"), rs.getBoolean("visible")),
                Timestamp.from(from), Timestamp.from(to));
        return new ReportData(headers, types, rows);
    }

    private ReportData customers(Instant from, Instant to) {
        List<String> headers = List.of(
                "Customer ID", "Name", "Email", "Phone", "Active", "Verified", "Registered At",
                "Orders", "Delivered Spend", "Reward Balance", "Coupons Used");
        List<ColumnType> types = List.of(
                ColumnType.TEXT, ColumnType.TEXT, ColumnType.TEXT, ColumnType.TEXT, ColumnType.BOOLEAN,
                ColumnType.BOOLEAN, ColumnType.DATE_TIME, ColumnType.INTEGER, ColumnType.CURRENCY,
                ColumnType.INTEGER, ColumnType.INTEGER);
        List<List<Object>> rows = jdbcTemplate.query("""
                select u.uuid, u.full_name, u.email, u.phone, u.is_active, u.is_verified, u.created_at,
                       (select count(*) from orders o where o.user_id=u.id and o.deleted_at is null) orders,
                       (select coalesce(sum(o.total),0) from orders o where o.user_id=u.id
                           and o.deleted_at is null and o.status='DELIVERED') delivered_spend,
                       coalesce((select balance from reward_accounts ra where ra.user_id=u.id and ra.deleted_at is null),0) rewards,
                       (select count(*) from coupon_redemptions cr where cr.user_id=u.id and cr.deleted_at is null) coupons
                from app_users u where u.deleted_at is null and u.role='ROLE_CUSTOMER'
                  and u.created_at >= ? and u.created_at < ? order by u.created_at desc
                """, (rs, row) -> {
            List<Object> values = new ArrayList<>();
            values.add(rs.getObject("uuid"));
            values.add(rs.getString("full_name"));
            values.add(rs.getString("email"));
            values.add(rs.getString("phone"));
            values.add(rs.getBoolean("is_active"));
            values.add(rs.getBoolean("is_verified"));
            values.add(rs.getTimestamp("created_at").toInstant());
            values.add(rs.getLong("orders"));
            values.add(rs.getBigDecimal("delivered_spend"));
            values.add(rs.getInt("rewards"));
            values.add(rs.getLong("coupons"));
            return values;
        }, Timestamp.from(from), Timestamp.from(to));
        return new ReportData(headers, types, rows);
    }

    private ReportData inventory() {
        List<String> headers = List.of(
                "Product ID", "Product", "Category", "Stock", "Low Stock Threshold",
                "Low Stock", "Out of Stock", "Visible", "Updated At");
        List<ColumnType> types = List.of(
                ColumnType.TEXT, ColumnType.TEXT, ColumnType.TEXT, ColumnType.INTEGER, ColumnType.INTEGER,
                ColumnType.BOOLEAN, ColumnType.BOOLEAN, ColumnType.BOOLEAN, ColumnType.DATE_TIME);
        List<List<Object>> rows = jdbcTemplate.query("""
                select p.uuid, p.name, c.name category, i.stock_quantity, i.low_stock_threshold,
                       (i.stock_quantity <= i.low_stock_threshold) low_stock,
                       (i.stock_quantity = 0) out_of_stock, i.visible, i.updated_at
                from inventory i join products p on p.id=i.product_id join categories c on c.id=p.category_id
                where i.deleted_at is null and p.deleted_at is null order by p.name
                """, (rs, row) -> List.of(
                rs.getObject("uuid"), rs.getString("name"), rs.getString("category"),
                rs.getInt("stock_quantity"), rs.getInt("low_stock_threshold"),
                rs.getBoolean("low_stock"), rs.getBoolean("out_of_stock"), rs.getBoolean("visible"),
                rs.getTimestamp("updated_at").toInstant()));
        return new ReportData(headers, types, rows);
    }

    private ReportData payments(Instant from, Instant to) {
        List<String> headers = List.of(
                "Payment ID", "Order Number", "Provider Order ID", "Provider Payment ID",
                "Status", "Amount", "Currency", "Attempt", "Failure Reason", "Created At");
        List<ColumnType> types = List.of(
                ColumnType.TEXT, ColumnType.TEXT, ColumnType.TEXT, ColumnType.TEXT, ColumnType.TEXT,
                ColumnType.CURRENCY, ColumnType.TEXT, ColumnType.INTEGER, ColumnType.TEXT, ColumnType.DATE_TIME);
        List<List<Object>> rows = jdbcTemplate.query("""
                select p.uuid, o.order_number, p.provider_order_id, p.provider_payment_id,
                       p.status, p.amount, p.currency, p.attempt_number, p.failure_reason, p.created_at
                from payments p join orders o on o.id=p.order_id
                where p.deleted_at is null and p.created_at >= ? and p.created_at < ?
                order by p.created_at desc
                """, (rs, row) -> {
            List<Object> values = new ArrayList<>();
            values.add(rs.getObject("uuid"));
            values.add(rs.getString("order_number"));
            values.add(rs.getString("provider_order_id"));
            values.add(rs.getString("provider_payment_id"));
            values.add(rs.getString("status"));
            values.add(rs.getBigDecimal("amount"));
            values.add(rs.getString("currency"));
            values.add(rs.getInt("attempt_number"));
            values.add(rs.getString("failure_reason"));
            values.add(rs.getTimestamp("created_at").toInstant());
            return values;
        }, Timestamp.from(from), Timestamp.from(to));
        return new ReportData(headers, types, rows);
    }

    private byte[] csv(ReportData data) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        output.writeBytes(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});
        writeCsvRow(output, new ArrayList<>(data.headers()));
        for (List<Object> row : data.rows()) writeCsvRow(output, row);
        return output.toByteArray();
    }

    private void writeCsvRow(ByteArrayOutputStream output, List<?> values) {
        String line = values.stream().map(this::csvValue).collect(java.util.stream.Collectors.joining(",")) + "\r\n";
        output.writeBytes(line.getBytes(StandardCharsets.UTF_8));
    }

    private String csvValue(Object raw) {
        String value = raw == null ? "" : raw instanceof Timestamp timestamp
                ? timestamp.toInstant().toString() : String.valueOf(raw);
        if (!value.isEmpty() && "=+-@".indexOf(value.charAt(0)) >= 0) value = "'" + value;
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private void validateRange(Instant from, Instant to) {
        if (from == null || to == null || !from.isBefore(to)) {
            throw new IllegalArgumentException("Report start must be before report end");
        }
        if (Duration.between(from, to).toDays() > 731) {
            throw new IllegalArgumentException("Report range cannot exceed two years");
        }
    }

    private String title(ReportType type) {
        String lower = type.name().toLowerCase(Locale.ROOT);
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    public enum ColumnType {
        TEXT, INTEGER, CURRENCY, DECIMAL, DATE_TIME, BOOLEAN
    }

    public record ReportData(List<String> headers, List<ColumnType> types, List<List<Object>> rows) {
        public ReportData {
            headers = List.copyOf(headers);
            types = List.copyOf(types);
            rows = List.copyOf(rows);
            if (headers.size() != types.size()) throw new IllegalArgumentException("Report column metadata is invalid");
        }
    }
}
