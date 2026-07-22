package com.burgerburst.repository;

import com.burgerburst.entity.Payment;
import com.burgerburst.entity.PaymentStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @EntityGraph(attributePaths = {"order", "order.user"})
    Optional<Payment> findByIdempotencyKeyAndDeletedAtIsNull(String key);
    @EntityGraph(attributePaths = {"order", "order.user"})
    Optional<Payment> findByProviderOrderIdAndDeletedAtIsNull(String providerOrderId);
    Optional<Payment> findByProviderPaymentIdAndDeletedAtIsNull(String providerPaymentId);
    boolean existsByOrderUuidAndStatusAndDeletedAtIsNull(UUID orderUuid, PaymentStatus status);
    long countByOrderUuidAndDeletedAtIsNull(UUID orderUuid);
    @EntityGraph(attributePaths = {"order", "order.user"})
    List<Payment> findByOrderUuidAndOrderUserUuidAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID orderUuid, UUID userUuid);
    @EntityGraph(attributePaths = {"order", "order.user"})
    Optional<Payment> findFirstByOrderUuidAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID orderUuid, PaymentStatus status);
    long countByStatusAndDeletedAtIsNull(PaymentStatus status);
}
