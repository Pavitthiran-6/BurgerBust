package com.burgerburst.config;

import com.burgerburst.entity.OrderStatus;
import com.burgerburst.entity.PaymentStatus;
import com.burgerburst.repository.InventoryRepository;
import com.burgerburst.repository.OrderRepository;
import com.burgerburst.repository.PaymentRepository;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.MeterBinder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CommerceMetricsConfiguration {

    @Bean
    MeterBinder commerceMetrics(
            OrderRepository orderRepository,
            InventoryRepository inventoryRepository,
            PaymentRepository paymentRepository) {
        return registry -> {
            gauge(registry, "burgerburst.orders.pending", () ->
                    orderRepository.countByStatusAndDeletedAtIsNull(OrderStatus.PLACED)
                            + orderRepository.countByStatusAndDeletedAtIsNull(OrderStatus.CONFIRMED)
                            + orderRepository.countByStatusAndDeletedAtIsNull(OrderStatus.PREPARING));
            gauge(registry, "burgerburst.inventory.low_stock", inventoryRepository::countLowStock);
            gauge(registry, "burgerburst.payments.failed", () ->
                    paymentRepository.countByStatusAndDeletedAtIsNull(PaymentStatus.FAILED));
        };
    }

    private void gauge(MeterRegistry registry, String name, java.util.function.Supplier<Number> supplier) {
        Gauge.builder(name, supplier, value -> value.get().doubleValue()).register(registry);
    }
}
