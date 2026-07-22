CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES app_users(id),
    order_id BIGINT REFERENCES orders(id),
    notification_type VARCHAR(40) NOT NULL,
    title VARCHAR(160) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_created
    ON notifications(user_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES app_users(id),
    order_id BIGINT NOT NULL REFERENCES orders(id),
    product_id BIGINT REFERENCES products(id),
    review_type VARCHAR(20) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(2000),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uk_reviews_product_order
    ON reviews(user_id, order_id, product_id, review_type)
    WHERE deleted_at IS NULL AND product_id IS NOT NULL;

CREATE UNIQUE INDEX uk_reviews_order_or_restaurant
    ON reviews(user_id, order_id, review_type)
    WHERE deleted_at IS NULL AND product_id IS NULL;

CREATE INDEX idx_reviews_product_created
    ON reviews(product_id, created_at DESC)
    WHERE deleted_at IS NULL;

