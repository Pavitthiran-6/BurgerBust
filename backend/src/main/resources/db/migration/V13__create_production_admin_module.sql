CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    session_id UUID NOT NULL,
    user_id BIGINT REFERENCES app_users(id),
    event_type VARCHAR(40) NOT NULL,
    product_uuid UUID,
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT ck_analytics_event_type CHECK (event_type IN (
        'PAGE_VIEWED', 'PRODUCT_VIEWED', 'PRODUCT_SEARCHED', 'CATEGORY_VIEWED',
        'ADDED_TO_CART', 'REMOVED_FROM_CART', 'CHECKOUT_STARTED', 'COUPON_APPLIED',
        'ORDER_PLACED', 'REVIEW_SUBMITTED'
    ))
);

CREATE TABLE admin_broadcasts (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    category VARCHAR(30) NOT NULL,
    title VARCHAR(160) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    recipient_count INTEGER NOT NULL CHECK (recipient_count >= 0),
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT ck_admin_broadcast_category CHECK (category IN ('ANNOUNCEMENT', 'OFFERS', 'MAINTENANCE'))
);

CREATE TABLE admin_audit_events (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    actor_uuid UUID,
    actor_email VARCHAR(320),
    http_method VARCHAR(10) NOT NULL,
    request_path VARCHAR(500) NOT NULL,
    outcome VARCHAR(20) NOT NULL,
    detail VARCHAR(500),
    request_id VARCHAR(100),
    duration_ms BIGINT NOT NULL CHECK (duration_ms >= 0),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT ck_admin_audit_outcome CHECK (outcome IN ('SUCCESS', 'FAILURE'))
);

DROP INDEX IF EXISTS idx_orders_status;
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_order_items_product_order ON order_items(product_uuid, order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_active_created ON app_users(role, is_active, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_created_rating ON reviews(created_at DESC, rating) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_created ON coupon_redemptions(coupon_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_occurred ON analytics_events(event_type, occurred_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_occurred ON analytics_events(session_id, occurred_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_admin_broadcasts_created ON admin_broadcasts(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_created ON admin_audit_events(created_at DESC) WHERE deleted_at IS NULL;

ALTER TABLE inventory_history DROP CONSTRAINT IF EXISTS ck_inventory_history_type;
ALTER TABLE inventory_history
    ADD CONSTRAINT ck_inventory_history_type
        CHECK (change_type IN (
            'CREATED', 'UPDATED', 'STOCK_SET', 'ORDER_RESERVED', 'ORDER_CANCELLED', 'ADJUSTMENT'
        ));
