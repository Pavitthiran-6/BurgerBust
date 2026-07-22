package com.burgerburst.email;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class BrevoEmailServiceTest {

    @Test
    void sendsBrandedOtpThroughTransactionalEmailApi() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        BrevoEmailService service = new BrevoEmailService(
                builder, "secret-api-key", "https://api.brevo.test", "login@burgerburst.example", "BurgerBurst");
        server.expect(requestTo("https://api.brevo.test/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", "secret-api-key"))
                .andExpect(jsonPath("$.sender.email").value("login@burgerburst.example"))
                .andExpect(jsonPath("$.to[0].email").value("customer@example.com"))
                .andExpect(jsonPath("$.htmlContent").value(org.hamcrest.Matchers.containsString("482901")))
                .andRespond(withSuccess("{\"messageId\":\"accepted\"}", MediaType.APPLICATION_JSON));

        service.sendOtp("customer@example.com", "482901", Instant.parse("2026-07-21T10:05:00Z"));

        server.verify();
    }

    @Test
    void refusesToStartWithoutProductionCredentials() {
        assertThatThrownBy(() -> new BrevoEmailService(
                RestClient.builder(), "", "https://api.brevo.test", "login@burgerburst.example", "BurgerBurst"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("BREVO_API_KEY");
    }

    @Test
    void normalizesCopiedEnvironmentValuesBeforeCallingBrevo() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        BrevoEmailService service = new BrevoEmailService(
                builder,
                "  \"secret-api-key\"  ",
                "  https://api.brevo.test/  ",
                "  'login@burgerburst.example'  ",
                "  BurgerBurst  ");
        server.expect(requestTo("https://api.brevo.test/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", "secret-api-key"))
                .andExpect(jsonPath("$.sender.email").value("login@burgerburst.example"))
                .andExpect(jsonPath("$.sender.name").value("BurgerBurst"))
                .andRespond(withSuccess("{\"messageId\":\"accepted\"}", MediaType.APPLICATION_JSON));

        service.sendOtp("customer@example.com", "482901", Instant.parse("2026-07-21T10:05:00Z"));

        server.verify();
    }
}
