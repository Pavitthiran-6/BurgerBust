package com.burgerburst.payment;

import com.burgerburst.config.ApplicationProperties;
import com.burgerburst.exception.BusinessRuleException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HttpRazorpayGateway implements RazorpayGateway {

    private final ApplicationProperties applicationProperties;
    private final ObjectMapper objectMapper;

    @Value("${app.integrations.razorpay-api-base-url}")
    private String apiBaseUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10)).build();

    @Override
    public ProviderOrder createOrder(
            long amountInSubunits, String currency, String receipt, Map<String, String> notes) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("amount", amountInSubunits);
        body.put("currency", currency);
        body.put("receipt", receipt);
        body.set("notes", objectMapper.valueToTree(notes));
        JsonNode response = send("/orders", body);
        return new ProviderOrder(requiredText(response, "id"), requiredText(response, "status"));
    }

    @Override
    public ProviderRefund refund(
            String paymentId, long amountInSubunits, String receipt, Map<String, String> notes) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("amount", amountInSubunits);
        body.put("speed", "normal");
        body.put("receipt", receipt);
        body.set("notes", objectMapper.valueToTree(notes));
        JsonNode response = send("/payments/" + paymentId + "/refund", body);
        return new ProviderRefund(requiredText(response, "id"), requiredText(response, "status"));
    }

    private JsonNode send(String path, JsonNode body) {
        ensureConfigured();
        try {
            String credentials = applicationProperties.integrations().razorpayKeyId()
                    + ":" + applicationProperties.integrations().razorpayKeySecret();
            HttpRequest request = HttpRequest.newBuilder(URI.create(apiBaseUrl.replaceAll("/$", "") + path))
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Basic " + Base64.getEncoder()
                            .encodeToString(credentials.getBytes(StandardCharsets.UTF_8)))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessRuleException("Payment provider rejected the request", HttpStatus.BAD_GATEWAY);
            }
            return objectMapper.readTree(response.body());
        } catch (BusinessRuleException exception) {
            throw exception;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new BusinessRuleException("Payment provider request was interrupted", HttpStatus.BAD_GATEWAY);
        } catch (Exception exception) {
            throw new BusinessRuleException("Payment provider is unavailable", HttpStatus.BAD_GATEWAY);
        }
    }

    private void ensureConfigured() {
        if (applicationProperties.integrations().razorpayKeyId().isBlank()
                || applicationProperties.integrations().razorpayKeySecret().isBlank()) {
            throw new BusinessRuleException("Razorpay is not configured", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    private String requiredText(JsonNode node, String field) {
        String value = node.path(field).asText();
        if (value.isBlank()) throw new BusinessRuleException("Invalid payment provider response", HttpStatus.BAD_GATEWAY);
        return value;
    }
}

