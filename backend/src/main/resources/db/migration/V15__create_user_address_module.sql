CREATE TABLE user_addresses (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES app_users (id),
    label VARCHAR(60) NOT NULL,
    tag VARCHAR(30) NOT NULL,
    recipient_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line_1 VARCHAR(200) NOT NULL,
    address_line_2 VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(12) NOT NULL,
    delivery_instructions VARCHAR(500),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT ck_user_addresses_tag CHECK (
        tag IN ('HOME BASE', 'WORK BASE', 'FRIENDS BASE', 'SECRET DEN')
    )
);

CREATE INDEX idx_user_addresses_user
    ON user_addresses (user_id, created_at)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uk_user_addresses_default
    ON user_addresses (user_id)
    WHERE is_default = TRUE AND deleted_at IS NULL;
