package com.burgerburst.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record AdminDashboardResponse(
        RevenueSummary revenue,
        OrderSummary orders,
        long activeCustomers,
        List<SalesPoint> dailySales,
        List<SalesPoint> weeklySales,
        List<SalesPoint> monthlySales,
        List<ProductMetric> bestSellingProducts,
        List<LowStockMetric> lowStockProducts,
        List<PendingOrderMetric> pendingOrders,
        Map<String, Long> orderStatusDistribution,
        ReviewSummary reviews,
        CouponSummary coupons,
        RewardStatistics rewards,
        List<AuditEntry> recentAdminActivity) {

    public record RevenueSummary(
            BigDecimal total,
            BigDecimal today,
            BigDecimal thisWeek,
            BigDecimal thisMonth,
            BigDecimal averageOrderValue) {
    }

    public record OrderSummary(long total, long today, long pending, long delivered, long cancelled) {
    }

    public record SalesPoint(String period, BigDecimal revenue, long orders) {
    }

    public record ProductMetric(UUID productId, String name, long quantity, BigDecimal revenue) {
    }

    public record LowStockMetric(UUID productId, String name, int stock, int threshold, boolean outOfStock) {
    }

    public record PendingOrderMetric(
            UUID orderId, String orderNumber, String customerName, String status,
            BigDecimal total, String currency, Instant placedAt) {
    }

    public record ReviewSummary(BigDecimal averageRating, long totalReviews, Map<Integer, Long> distribution) {
    }

    public record CouponSummary(long redemptions, BigDecimal totalDiscount, String mostUsedCode) {
    }

    public record RewardStatistics(long outstanding, long issued, long redeemed, long activeAccounts) {
    }

    public record AuditEntry(
            UUID id, UUID actorId, String actorEmail, String method, String path,
            String outcome, String detail, String requestId, long durationMs, Instant createdAt) {
    }
}
