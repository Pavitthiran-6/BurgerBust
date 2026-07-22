CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    provider_order_id VARCHAR(100) NOT NULL UNIQUE,
    provider_payment_id VARCHAR(100) UNIQUE,
    provider_refund_id VARCHAR(100) UNIQUE,
    idempotency_key VARCHAR(120) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL,
    attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
    failure_reason VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_order_created ON payments(order_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE payment_audit_events (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    payment_id BIGINT REFERENCES payments(id),
    event_type VARCHAR(40) NOT NULL,
    external_event_id VARCHAR(120),
    detail VARCHAR(500),
    payload_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_payment_audit_payment ON payment_audit_events(payment_id, created_at DESC);

CREATE TABLE payment_webhook_events (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    event_id VARCHAR(120) NOT NULL UNIQUE,
    event_type VARCHAR(80) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

