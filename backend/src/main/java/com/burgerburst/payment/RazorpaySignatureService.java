package com.burgerburst.payment;

import com.burgerburst.config.ApplicationProperties;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RazorpaySignatureService {

    private final ApplicationProperties applicationProperties;

    @Value("${app.integrations.razorpay-webhook-secret:}")
    private String webhookSecret;

    public boolean verifyPayment(String providerOrderId, String providerPaymentId, String signature) {
        String expected = hmac(providerOrderId + "|" + providerPaymentId,
                applicationProperties.integrations().razorpayKeySecret());
        return constantTimeEquals(expected, signature);
    }

    public boolean verifyWebhook(String rawBody, String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) return false;
        return constantTimeEquals(hmac(rawBody, webhookSecret), signature);
    }

    public String sha256(String value) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 unavailable", exception);
        }
    }

    private String hmac(String value, String secret) {
        if (secret == null || secret.isBlank()) return "";
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to calculate payment signature", exception);
        }
    }

    private boolean constantTimeEquals(String expected, String supplied) {
        if (supplied == null) return false;
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.US_ASCII),
                supplied.toLowerCase().getBytes(StandardCharsets.US_ASCII));
    }
}

