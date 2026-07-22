package com.burgerburst.service;

import com.burgerburst.config.ApplicationProperties;
import com.burgerburst.dto.order.OrderStatusUpdateRequest;
import com.burgerburst.dto.payment.CreatePaymentRequest;
import com.burgerburst.dto.payment.PaymentResponse;
import com.burgerburst.dto.payment.VerifyPaymentRequest;
import com.burgerburst.entity.CustomerOrder;
import com.burgerburst.entity.NotificationType;
import com.burgerburst.entity.OrderStatus;
import com.burgerburst.entity.Payment;
import com.burgerburst.entity.PaymentAuditEvent;
import com.burgerburst.entity.PaymentAuditType;
import com.burgerburst.entity.PaymentMethod;
import com.burgerburst.entity.PaymentStatus;
import com.burgerburst.entity.PaymentWebhookEvent;
import com.burgerburst.event.CommerceNotificationEvent;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.exception.ResourceNotFoundException;
import com.burgerburst.payment.RazorpayGateway;
import com.burgerburst.payment.RazorpaySignatureService;
import com.burgerburst.repository.OrderRepository;
import com.burgerburst.repository.PaymentAuditRepository;
import com.burgerburst.repository.PaymentRepository;
import com.burgerburst.repository.PaymentWebhookEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentAuditRepository auditRepository;
    private final PaymentWebhookEventRepository webhookEventRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final RazorpayGateway gateway;
    private final RazorpaySignatureService signatureService;
    private final ApplicationProperties applicationProperties;
    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    @Transactional
    public PaymentResponse create(UUID userUuid, CreatePaymentRequest request, String idempotencyKey) {
        CustomerOrder order = orderRepository.findByUuidAndUserUuidAndDeletedAtIsNull(request.orderId(), userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (order.getPaymentMethod() != PaymentMethod.RAZORPAY) {
            throw rule("Order does not use Razorpay");
        }
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.REFUNDED) {
            throw rule("Payment cannot be created for this order");
        }
        Payment idempotent = paymentRepository.findByIdempotencyKeyAndDeletedAtIsNull(idempotencyKey).orElse(null);
        if (idempotent != null) {
            if (!idempotent.getOrder().getUuid().equals(order.getUuid())
                    || !idempotent.getOrder().getUser().getUuid().equals(userUuid)) {
                throw new BusinessRuleException("Idempotency key is already in use", HttpStatus.CONFLICT);
            }
            return toResponse(idempotent);
        }
        Payment successful = paymentRepository
                .findFirstByOrderUuidAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(order.getUuid(), PaymentStatus.SUCCESS)
                .orElse(null);
        if (successful != null) return toResponse(successful);

        long amount = subunits(order.getTotal());
        RazorpayGateway.ProviderOrder providerOrder = gateway.createOrder(
                amount, order.getCurrency(), order.getOrderNumber(),
                Map.of("burgerburst_order_id", order.getUuid().toString()));
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setProviderOrderId(providerOrder.id());
        payment.setIdempotencyKey(idempotencyKey);
        payment.setStatus(PaymentStatus.CREATED);
        payment.setAmount(order.getTotal());
        payment.setCurrency(order.getCurrency());
        payment.setAttemptNumber((int) paymentRepository.countByOrderUuidAndDeletedAtIsNull(order.getUuid()) + 1);
        paymentRepository.save(payment);
        audit(payment, PaymentAuditType.PROVIDER_ORDER_CREATED, null, "Provider order created", null);
        return toResponse(payment);
    }

    @Transactional
    public PaymentResponse verify(UUID userUuid, VerifyPaymentRequest request) {
        Payment payment = paymentRepository.findByProviderOrderIdAndDeletedAtIsNull(request.razorpayOrderId())
                .filter(value -> value.getOrder().getUser().getUuid().equals(userUuid))
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            if (request.razorpayPaymentId().equals(payment.getProviderPaymentId())) return toResponse(payment);
            throw new BusinessRuleException("Order is already paid", HttpStatus.CONFLICT);
        }
        if (!signatureService.verifyPayment(
                payment.getProviderOrderId(), request.razorpayPaymentId(), request.razorpaySignature())) {
            audit(payment, PaymentAuditType.VERIFICATION_FAILED, null, "Payment signature rejected", null);
            throw new BusinessRuleException("Invalid payment signature", HttpStatus.UNAUTHORIZED);
        }
        Payment duplicate = paymentRepository.findByProviderPaymentIdAndDeletedAtIsNull(request.razorpayPaymentId())
                .orElse(null);
        if (duplicate != null && !duplicate.getUuid().equals(payment.getUuid())) {
            throw new BusinessRuleException("Duplicate payment", HttpStatus.CONFLICT);
        }
        markSuccess(payment, request.razorpayPaymentId(), PaymentAuditType.VERIFICATION_SUCCESS, null, null);
        return toResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getHistory(UUID userUuid, UUID orderUuid) {
        List<Payment> payments = paymentRepository
                .findByOrderUuidAndOrderUserUuidAndDeletedAtIsNullOrderByCreatedAtDesc(orderUuid, userUuid);
        if (payments.isEmpty()) {
            orderRepository.findByUuidAndUserUuidAndDeletedAtIsNull(orderUuid, userUuid)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        }
        return payments.stream().map(this::toResponse).toList();
    }

    @Transactional
    public void processWebhook(String rawBody, String signature, String suppliedEventId) {
        if (!signatureService.verifyWebhook(rawBody, signature)) {
            throw new BusinessRuleException("Invalid webhook signature", HttpStatus.UNAUTHORIZED);
        }
        String payloadHash = signatureService.sha256(rawBody);
        String eventId = suppliedEventId == null || suppliedEventId.isBlank() ? payloadHash : suppliedEventId.strip();
        if (webhookEventRepository.existsByEventId(eventId)) return;
        try {
            JsonNode payload = objectMapper.readTree(rawBody);
            String eventType = payload.path("event").asText();
            switch (eventType) {
                case "payment.captured" -> captured(payload, eventId, payloadHash);
                case "payment.failed" -> failed(payload, eventId, payloadHash);
                case "refund.processed" -> refunded(payload, eventId, payloadHash);
                default -> { }
            }
            PaymentWebhookEvent event = new PaymentWebhookEvent();
            event.setEventId(eventId);
            event.setEventType(eventType.isBlank() ? "unknown" : eventType);
            event.setPayloadHash(payloadHash);
            event.setProcessedAt(clock.instant());
            webhookEventRepository.save(event);
        } catch (BusinessRuleException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new BusinessRuleException("Malformed webhook payload", HttpStatus.BAD_REQUEST);
        }
    }

    @Transactional
    public PaymentResponse refund(UUID orderUuid, String reason) {
        Payment payment = paymentRepository
                .findFirstByOrderUuidAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(orderUuid, PaymentStatus.SUCCESS)
                .orElseThrow(() -> new ResourceNotFoundException("Successful payment not found"));
        RazorpayGateway.ProviderRefund refund = gateway.refund(
                payment.getProviderPaymentId(), subunits(payment.getAmount()),
                "RF-" + payment.getOrder().getOrderNumber(),
                Map.of("reason", reason == null || reason.isBlank() ? "Admin refund" : reason.strip()));
        payment.setProviderRefundId(refund.id());
        payment.setStatus("processed".equalsIgnoreCase(refund.status())
                ? PaymentStatus.REFUNDED : PaymentStatus.REFUND_PENDING);
        paymentRepository.save(payment);
        audit(payment, PaymentAuditType.REFUND_REQUESTED, refund.id(), "Refund requested", null);
        if (payment.getStatus() == PaymentStatus.REFUNDED
                && payment.getOrder().getStatus() == OrderStatus.DELIVERED) {
            orderService.updateStatus(orderUuid, new OrderStatusUpdateRequest(OrderStatus.REFUNDED, "Payment refunded"));
        }
        return toResponse(payment);
    }

    private void captured(JsonNode payload, String eventId, String payloadHash) {
        JsonNode entity = payload.path("payload").path("payment").path("entity");
        String providerOrderId = entity.path("order_id").asText();
        String providerPaymentId = entity.path("id").asText();
        Payment payment = paymentRepository.findByProviderOrderIdAndDeletedAtIsNull(providerOrderId).orElse(null);
        if (payment != null && payment.getStatus() != PaymentStatus.SUCCESS) {
            markSuccess(payment, providerPaymentId, PaymentAuditType.WEBHOOK_PAYMENT_CAPTURED, eventId, payloadHash);
        }
    }

    private void failed(JsonNode payload, String eventId, String payloadHash) {
        JsonNode entity = payload.path("payload").path("payment").path("entity");
        Payment payment = paymentRepository.findByProviderOrderIdAndDeletedAtIsNull(entity.path("order_id").asText())
                .orElse(null);
        if (payment != null && payment.getStatus() != PaymentStatus.SUCCESS) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setProviderPaymentId(blankToNull(entity.path("id").asText()));
            payment.setFailureReason(truncate(entity.path("error_description").asText("Payment failed"), 500));
            paymentRepository.save(payment);
            audit(payment, PaymentAuditType.WEBHOOK_PAYMENT_FAILED, eventId, payment.getFailureReason(), payloadHash);
            publish(payment, NotificationType.PAYMENT_FAILURE, "Payment failed",
                    "Payment failed for order " + payment.getOrder().getOrderNumber() + ". You can retry.");
        }
    }

    private void refunded(JsonNode payload, String eventId, String payloadHash) {
        JsonNode entity = payload.path("payload").path("refund").path("entity");
        Payment payment = paymentRepository.findByProviderPaymentIdAndDeletedAtIsNull(entity.path("payment_id").asText())
                .orElse(null);
        if (payment != null) {
            payment.setProviderRefundId(blankToNull(entity.path("id").asText()));
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
            audit(payment, PaymentAuditType.WEBHOOK_REFUND_PROCESSED, eventId, "Refund processed", payloadHash);
            if (payment.getOrder().getStatus() == OrderStatus.DELIVERED) {
                orderService.updateStatus(payment.getOrder().getUuid(),
                        new OrderStatusUpdateRequest(OrderStatus.REFUNDED, "Payment refunded"));
            }
        }
    }

    private void markSuccess(
            Payment payment,
            String providerPaymentId,
            PaymentAuditType type,
            String externalEventId,
            String payloadHash) {
        Payment duplicate = paymentRepository.findByProviderPaymentIdAndDeletedAtIsNull(providerPaymentId).orElse(null);
        if (duplicate != null && !duplicate.getUuid().equals(payment.getUuid())) {
            throw new BusinessRuleException("Duplicate payment", HttpStatus.CONFLICT);
        }
        payment.setProviderPaymentId(providerPaymentId);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setFailureReason(null);
        paymentRepository.save(payment);
        audit(payment, type, externalEventId, "Payment verified", payloadHash);
        if (payment.getOrder().getStatus() == OrderStatus.PAYMENT_PENDING) {
            orderService.completePaidOrder(payment.getOrder().getUuid());
        }
        publish(payment, NotificationType.PAYMENT_SUCCESS, "Payment successful",
                "Payment succeeded for order " + payment.getOrder().getOrderNumber() + ".");
    }

    private PaymentAuditEvent audit(
            Payment payment, PaymentAuditType type, String externalEventId, String detail, String payloadHash) {
        PaymentAuditEvent event = new PaymentAuditEvent();
        event.setPayment(payment);
        event.setEventType(type);
        event.setExternalEventId(externalEventId);
        event.setDetail(truncate(detail, 500));
        event.setPayloadHash(payloadHash);
        return auditRepository.save(event);
    }

    private PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getUuid(), payment.getOrder().getUuid(), payment.getOrder().getOrderNumber(),
                applicationProperties.integrations().razorpayKeyId(), payment.getProviderOrderId(),
                payment.getProviderPaymentId(), payment.getProviderRefundId(), payment.getStatus(), payment.getAmount(),
                subunits(payment.getAmount()), payment.getCurrency(), payment.getAttemptNumber(),
                payment.getFailureReason(), payment.getCreatedAt(), payment.getUpdatedAt());
    }

    private void publish(Payment payment, NotificationType type, String title, String message) {
        eventPublisher.publishEvent(new CommerceNotificationEvent(
                payment.getOrder().getUser().getUuid(), type, title, message, payment.getOrder().getUuid()));
    }

    private long subunits(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private String truncate(String value, int maximum) {
        if (value == null) return null;
        return value.length() <= maximum ? value : value.substring(0, maximum);
    }

    private BusinessRuleException rule(String message) {
        return new BusinessRuleException(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
