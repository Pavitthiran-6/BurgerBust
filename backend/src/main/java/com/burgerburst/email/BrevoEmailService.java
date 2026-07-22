package com.burgerburst.email;

import com.burgerburst.exception.EmailDeliveryException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Slf4j
@Service
@Profile("prod")
@ConditionalOnProperty(name = "app.email.provider", havingValue = "brevo")
public class BrevoEmailService implements EmailService {

    private final RestClient restClient;
    private final String apiKey;
    private final String senderEmail;
    private final String senderName;

    public BrevoEmailService(
            RestClient.Builder builder,
            @Value("${app.integrations.brevo-api-key:}") String apiKey,
            @Value("${app.email.brevo-base-url:https://api.brevo.com}") String baseUrl,
            @Value("${app.email.sender-email:}") String senderEmail,
            @Value("${app.email.sender-name:BurgerBurst}") String senderName) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("BREVO_API_KEY is required when EMAIL_PROVIDER=brevo");
        }
        if (senderEmail == null || senderEmail.isBlank()) {
            throw new IllegalStateException("EMAIL_SENDER_EMAIL is required when EMAIL_PROVIDER=brevo");
        }
        this.restClient = builder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
        this.senderEmail = senderEmail;
        this.senderName = senderName == null || senderName.isBlank() ? "BurgerBurst" : senderName.strip();
    }

    @Override
    public void sendOtp(String recipientEmail, String otp, Instant expiresAt) {
        Map<String, Object> payload = Map.of(
                "sender", Map.of("name", senderName, "email", senderEmail),
                "to", List.of(Map.of("email", recipientEmail)),
                "subject", "Your BurgerBurst sign-in code",
                "htmlContent", html(otp, expiresAt));
        try {
            restClient.post().uri("/v3/smtp/email")
                    .header("api-key", apiKey)
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            log.info("OTP email accepted by Brevo recipient={} expiresAt={}", recipientEmail, expiresAt);
        } catch (RestClientException exception) {
            log.error("Brevo rejected OTP email recipient={}", recipientEmail);
            throw new EmailDeliveryException("OTP email could not be delivered", exception);
        }
    }

    private String html(String otp, Instant expiresAt) {
        String expiry = DateTimeFormatter.ofPattern("HH:mm 'UTC'")
                .withZone(ZoneOffset.UTC).format(expiresAt);
        return """
                <!doctype html><html><body style="margin:0;background:#fff8e7;font-family:Arial,sans-serif;color:#1a1c1c">
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="padding:32px 12px"><tr><td align="center">
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fff;border:4px solid #111;border-radius:20px;box-shadow:8px 8px 0 #111">
                <tr><td style="background:#ffd23f;border-bottom:4px solid #111;padding:24px;text-align:center"><h1 style="margin:0;font-size:28px">BURGERBURST</h1></td></tr>
                <tr><td style="padding:32px;text-align:center"><p style="font-size:16px;font-weight:700">Use this one-time code to sign in:</p>
                <div style="display:inline-block;margin:12px 0 20px;padding:16px 24px;border:3px solid #111;border-radius:14px;background:#00f0ff;font-size:34px;font-weight:900;letter-spacing:9px">%s</div>
                <p style="font-size:13px;color:#555">This code expires at %s. Never share it with anyone.</p>
                <p style="font-size:12px;color:#777;margin-top:28px">If you did not request this code, you can safely ignore this email.</p></td></tr>
                </table></td></tr></table></body></html>
                """.formatted(otp, expiry);
    }
}
