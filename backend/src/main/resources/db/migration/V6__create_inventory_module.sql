CREATE TABLE inventory (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL UNIQUE REFERENCES products (id) ON DELETE CASCADE,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT ck_inventory_quantity CHECK (stock_quantity >= 0),
    CONSTRAINT ck_inventory_threshold CHECK (low_stock_threshold >= 0)
);

CREATE TABLE inventory_history (
    id BIGSERIAL PRIMARY KEY,
    inventory_id BIGINT NOT NULL REFERENCES inventory (id) ON DELETE CASCADE,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    change_type VARCHAR(20) NOT NULL,
    reason VARCHAR(500),
    changed_by UUID,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT ck_inventory_history_type CHECK (change_type IN ('CREATED', 'UPDATED', 'STOCK_SET')),
    CONSTRAINT ck_inventory_history_quantities CHECK (previous_quantity >= 0 AND new_quantity >= 0)
);

CREATE INDEX idx_inventory_low_stock ON inventory (stock_quantity, low_stock_threshold) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_history_inventory ON inventory_history (inventory_id, created_at DESC);

INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold, visible, created_at, updated_at)
SELECT product.id, 100, 10, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM products product
WHERE product.deleted_at IS NULL
ON CONFLICT (product_id) DO NOTHING;
