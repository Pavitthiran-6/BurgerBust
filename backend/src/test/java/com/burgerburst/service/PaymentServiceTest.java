package com.burgerburst.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.burgerburst.config.ApplicationProperties;
import com.burgerburst.dto.payment.CreatePaymentRequest;
import com.burgerburst.dto.payment.VerifyPaymentRequest;
import com.burgerburst.entity.CustomerOrder;
import com.burgerburst.entity.OrderStatus;
import com.burgerburst.entity.Payment;
import com.burgerburst.entity.PaymentAuditEvent;
import com.burgerburst.entity.PaymentMethod;
import com.burgerburst.entity.PaymentStatus;
import com.burgerburst.entity.User;
import com.burgerburst.exception.BusinessRuleException;
import com.burgerburst.payment.RazorpayGateway;
import com.burgerburst.payment.RazorpaySignatureService;
import com.burgerburst.repository.OrderRepository;
import com.burgerburst.repository.PaymentAuditRepository;
import com.burgerburst.repository.PaymentRepository;
import com.burgerburst.repository.PaymentWebhookEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private PaymentAuditRepository auditRepository;
    @Mock private PaymentWebhookEventRepository webhookRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private OrderService orderService;
    @Mock private RazorpayGateway gateway;
    @Mock private RazorpaySignatureService signatureService;
    @Mock private ApplicationEventPublisher eventPublisher;

    private PaymentService service;
    private User user;
    private CustomerOrder order;

    @BeforeEach
    void setUp() {
        ApplicationProperties properties = new ApplicationProperties(
                new ApplicationProperties.Jwt("unused", Duration.ofDays(7)),
                new ApplicationProperties.Cors(List.of("http://localhost:5173")),
                new ApplicationProperties.Otp(Duration.ofMinutes(5), 6, 5),
                new ApplicationProperties.Integrations("", "rzp_test_key", "secret"));
        service = new PaymentService(
                paymentRepository, auditRepository, webhookRepository, orderRepository, orderService, gateway,
                signatureService, properties, new ObjectMapper(), eventPublisher,
                Clock.fixed(Instant.parse("2026-07-21T12:00:00Z"), ZoneOffset.UTC));
        user = new User();
        user.setUuid(UUID.randomUUID());
        order = new CustomerOrder();
        order.setUuid(UUID.randomUUID());
        order.setOrderNumber("BB-20260721-TEST");
        order.setUser(user);
        order.setStatus(OrderStatus.PLACED);
        order.setPaymentMethod(PaymentMethod.RAZORPAY);
        order.setTotal(new BigDecimal("20.50"));
        order.setCurrency("INR");
    }

    @Test
    void createsProviderOrderWithIdempotencyKey() {
        when(orderRepository.findByUuidAndUserUuidAndDeletedAtIsNull(order.getUuid(), user.getUuid()))
                .thenReturn(Optional.of(order));
        when(paymentRepository.findByIdempotencyKeyAndDeletedAtIsNull("idem-1")).thenReturn(Optional.empty());
        when(paymentRepository.findFirstByOrderUuidAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
                order.getUuid(), PaymentStatus.SUCCESS)).thenReturn(Optional.empty());
        when(gateway.createOrder(eq(2050L), eq("INR"), eq(order.getOrderNumber()), anyMap()))
                .thenReturn(new RazorpayGateway.ProviderOrder("order_rzp", "created"));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(auditRepository.save(any(PaymentAuditEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.create(user.getUuid(), new CreatePaymentRequest(order.getUuid()), "idem-1");

        assertThat(response.razorpayOrderId()).isEqualTo("order_rzp");
        assertThat(response.amountInSubunits()).isEqualTo(2050L);
        assertThat(response.status()).isEqualTo(PaymentStatus.CREATED);
    }

    @Test
    void returnsExistingAttemptForSameIdempotencyKey() {
        Payment existing = payment("order_existing");
        when(orderRepository.findByUuidAndUserUuidAndDeletedAtIsNull(order.getUuid(), user.getUuid()))
                .thenReturn(Optional.of(order));
        when(paymentRepository.findByIdempotencyKeyAndDeletedAtIsNull("idem-1")).thenReturn(Optional.of(existing));

        var response = service.create(user.getUuid(), new CreatePaymentRequest(order.getUuid()), "idem-1");

        assertThat(response.razorpayOrderId()).isEqualTo("order_existing");
        verify(gateway, never()).createOrder(any(Long.class), any(), any(), anyMap());
    }

    @Test
    void rejectsInvalidCheckoutSignature() {
        Payment payment = payment("order_rzp");
        when(paymentRepository.findByProviderOrderIdAndDeletedAtIsNull("order_rzp"))
                .thenReturn(Optional.of(payment));
        when(signatureService.verifyPayment("order_rzp", "pay_1", "bad")).thenReturn(false);
        when(auditRepository.save(any(PaymentAuditEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThatThrownBy(() -> service.verify(user.getUuid(),
                new VerifyPaymentRequest("order_rzp", "pay_1", "bad")))
                .isInstanceOf(BusinessRuleException.class).hasMessageContaining("signature");
    }

    @Test
    void capturedWebhookConfirmsPaymentIdempotently() {
        Payment payment = payment("order_rzp");
        String body = "{\"event\":\"payment.captured\",\"payload\":{\"payment\":{\"entity\":{\"id\":\"pay_1\",\"order_id\":\"order_rzp\"}}}}";
        when(signatureService.verifyWebhook(body, "signature")).thenReturn(true);
        when(signatureService.sha256(body)).thenReturn("a".repeat(64));
        when(webhookRepository.existsByEventId("evt-1")).thenReturn(false);
        when(paymentRepository.findByProviderOrderIdAndDeletedAtIsNull("order_rzp"))
                .thenReturn(Optional.of(payment));
        when(paymentRepository.findByProviderPaymentIdAndDeletedAtIsNull("pay_1")).thenReturn(Optional.empty());
        when(paymentRepository.save(payment)).thenReturn(payment);
        when(auditRepository.save(any(PaymentAuditEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.processWebhook(body, "signature", "evt-1");

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(payment.getProviderPaymentId()).isEqualTo("pay_1");
        verify(orderService).updateStatus(eq(order.getUuid()), any());
        verify(webhookRepository).save(any());
    }

    private Payment payment(String providerOrderId) {
        Payment payment = new Payment();
        payment.setUuid(UUID.randomUUID());
        payment.setOrder(order);
        payment.setProviderOrderId(providerOrderId);
        payment.setIdempotencyKey("idem-1");
        payment.setStatus(PaymentStatus.CREATED);
        payment.setAmount(order.getTotal());
        payment.setCurrency(order.getCurrency());
        payment.setAttemptNumber(1);
        return payment;
    }
}
