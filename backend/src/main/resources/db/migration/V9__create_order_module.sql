CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    order_number VARCHAR(40) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES app_users(id),
    status VARCHAR(30) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    coupon_discount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (coupon_discount >= 0),
    reward_discount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (reward_discount >= 0),
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    currency VARCHAR(3) NOT NULL,
    coupon_code VARCHAR(40),
    reward_points_used INTEGER NOT NULL DEFAULT 0 CHECK (reward_points_used >= 0),
    reward_points_earned INTEGER NOT NULL DEFAULT 0 CHECK (reward_points_earned >= 0),
    recipient_name VARCHAR(120) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    address_line_1 VARCHAR(200) NOT NULL,
    address_line_2 VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    delivery_instructions VARCHAR(500),
    cancellation_reason VARCHAR(500),
    placed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    product_uuid UUID NOT NULL,
    product_name VARCHAR(160) NOT NULL,
    image_url VARCHAR(1000),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    note VARCHAR(500),
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id, occurred_at);

CREATE TABLE coupon_redemptions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    coupon_id BIGINT NOT NULL REFERENCES coupons(id),
    user_id BIGINT NOT NULL REFERENCES app_users(id),
    order_uuid UUID NOT NULL UNIQUE,
    discount_amount NUMERIC(12, 2) NOT NULL CHECK (discount_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_coupon_redemptions_coupon ON coupon_redemptions(coupon_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_coupon_redemptions_user ON coupon_redemptions(user_id) WHERE deleted_at IS NULL;

