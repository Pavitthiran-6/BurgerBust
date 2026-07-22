package com.burgerburst.payment;

import static org.assertj.core.api.Assertions.assertThat;

import com.burgerburst.config.ApplicationProperties;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HexFormat;
import java.util.List;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class RazorpaySignatureServiceTest {

    private RazorpaySignatureService service;

    @BeforeEach
    void setUp() {
        ApplicationProperties properties = new ApplicationProperties(
                new ApplicationProperties.Jwt("unused", Duration.ofDays(7)),
                new ApplicationProperties.Cors(List.of("http://localhost:5173")),
                new ApplicationProperties.Otp(Duration.ofMinutes(5), 6, 5),
                new ApplicationProperties.Integrations("", "rzp_test", "payment-secret"));
        service = new RazorpaySignatureService(properties);
        ReflectionTestUtils.setField(service, "webhookSecret", "webhook-secret");
    }

    @Test
    void acceptsValidPaymentSignature() throws Exception {
        String signature = hmac("order_123|pay_123", "payment-secret");
        assertThat(service.verifyPayment("order_123", "pay_123", signature)).isTrue();
    }

    @Test
    void rejectsWrongPaymentSignature() {
        assertThat(service.verifyPayment("order_123", "pay_123", "deadbeef")).isFalse();
    }

    @Test
    void signsUntouchedWebhookBody() throws Exception {
        String body = "{\"event\":\"payment.captured\"}";
        assertThat(service.verifyWebhook(body, hmac(body, "webhook-secret"))).isTrue();
        assertThat(service.verifyWebhook(body + " ", hmac(body, "webhook-secret"))).isFalse();
    }

    private String hmac(String value, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    }
}
