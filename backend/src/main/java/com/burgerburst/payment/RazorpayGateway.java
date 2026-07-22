package com.burgerburst.payment;

import java.util.Map;

public interface RazorpayGateway {

    ProviderOrder createOrder(long amountInSubunits, String currency, String receipt, Map<String, String> notes);

    ProviderRefund refund(String paymentId, long amountInSubunits, String receipt, Map<String, String> notes);

    record ProviderOrder(String id, String status) {
    }

    record ProviderRefund(String id, String status) {
    }
}

