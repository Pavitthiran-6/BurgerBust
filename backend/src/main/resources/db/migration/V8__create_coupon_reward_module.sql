CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    code VARCHAR(40) NOT NULL UNIQUE,
    description VARCHAR(500),
    discount_type VARCHAR(20) NOT NULL,
    discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
    maximum_discount NUMERIC(12, 2),
    minimum_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (minimum_order_amount >= 0),
    valid_from TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    total_usage_limit INTEGER,
    per_customer_limit INTEGER NOT NULL DEFAULT 1 CHECK (per_customer_limit > 0),
    new_customers_only BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT ck_coupon_validity CHECK (expires_at > valid_from)
);

ALTER TABLE carts
    ADD COLUMN coupon_id BIGINT REFERENCES coupons(id);

CREATE TABLE reward_accounts (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    user_id BIGINT NOT NULL UNIQUE REFERENCES app_users(id),
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_earned INTEGER NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
    total_redeemed INTEGER NOT NULL DEFAULT 0 CHECK (total_redeemed >= 0),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE reward_transactions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    reward_account_id BIGINT NOT NULL REFERENCES reward_accounts(id),
    transaction_type VARCHAR(20) NOT NULL,
    points INTEGER NOT NULL CHECK (points <> 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    order_uuid UUID,
    description VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_reward_transactions_account_created
    ON reward_transactions(reward_account_id, created_at DESC)
    WHERE deleted_at IS NULL;

INSERT INTO coupons (
    uuid, code, description, discount_type, discount_value, maximum_discount,
    minimum_order_amount, valid_from, expires_at, total_usage_limit,
    per_customer_limit, new_customers_only, active, created_at, updated_at)
VALUES
    ('c0000000-0000-4000-8000-000000000001', 'WELCOME20', '20% off for a first BurgerBurst order', 'PERCENTAGE', 20.00, 10.00, 15.00, NOW(), '2099-12-31T23:59:59Z', NULL, 1, TRUE, TRUE, NOW(), NOW()),
    ('c0000000-0000-4000-8000-000000000002', 'BURST10', '10% off eligible orders', 'PERCENTAGE', 10.00, 8.00, 20.00, NOW(), '2099-12-31T23:59:59Z', NULL, 5, FALSE, TRUE, NOW(), NOW()),
    ('c0000000-0000-4000-8000-000000000003', 'FLAT5', 'Flat 5 currency units off', 'FIXED', 5.00, NULL, 25.00, NOW(), '2099-12-31T23:59:59Z', NULL, 3, FALSE, TRUE, NOW(), NOW());

