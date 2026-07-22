package com.burgerburst.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record AdminAnalyticsResponse(
        Instant from,
        Instant to,
        BigDecimal revenue,
        long orders,
        BigDecimal averageOrderValue,
        List<AdminDashboardResponse.SalesPoint> revenueSeries,
        List<AdminDashboardResponse.ProductMetric> topSellingProducts,
        List<PeakHour> peakOrderHours,
        List<CustomerGrowth> customerGrowth,
        FunnelMetrics conversion,
        List<CategoryPerformance> categoryPerformance) {

    public record PeakHour(int hour, long orders, BigDecimal revenue) {
    }

    public record CustomerGrowth(LocalDate date, long newCustomers) {
    }

    public record FunnelMetrics(
            long visitors,
            long productViewers,
            long cartSessions,
            long checkoutSessions,
            long orderingSessions,
            BigDecimal viewToCartRate,
            BigDecimal cartToCheckoutRate,
            BigDecimal checkoutToOrderRate) {
    }

    public record CategoryPerformance(String category, long quantity, BigDecimal revenue) {
    }
}
