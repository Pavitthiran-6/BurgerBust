ALTER TABLE restaurant_settings
    ADD COLUMN tagline VARCHAR(200),
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    ADD COLUMN delivery_radius_km NUMERIC(8, 2) NOT NULL DEFAULT 10,
    ADD COLUMN delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN estimated_delivery_minutes INTEGER NOT NULL DEFAULT 30,
    ADD COLUMN banner_url VARCHAR(1000),
    ADD COLUMN logo_url VARCHAR(1000),
    ADD COLUMN address_line_1 VARCHAR(200),
    ADD COLUMN address_line_2 VARCHAR(200),
    ADD COLUMN city VARCHAR(100),
    ADD COLUMN state VARCHAR(100),
    ADD COLUMN postal_code VARCHAR(20),
    ADD COLUMN country VARCHAR(100),
    ADD COLUMN facebook_url VARCHAR(1000),
    ADD COLUMN instagram_url VARCHAR(1000),
    ADD COLUMN x_url VARCHAR(1000),
    ADD COLUMN gst_number VARCHAR(30),
    ADD COLUMN fssai_number VARCHAR(30),
    ADD COLUMN service_available BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN maintenance_message VARCHAR(500),
    ADD CONSTRAINT ck_restaurant_status CHECK (status IN ('OPEN', 'CLOSED', 'BUSY')),
    ADD CONSTRAINT ck_restaurant_delivery_radius CHECK (delivery_radius_km >= 0),
    ADD CONSTRAINT ck_restaurant_delivery_fee CHECK (delivery_fee >= 0),
    ADD CONSTRAINT ck_restaurant_delivery_time CHECK (estimated_delivery_minutes > 0);

CREATE TABLE restaurant_operating_hours (
    id BIGSERIAL PRIMARY KEY,
    restaurant_settings_id BIGINT NOT NULL REFERENCES restaurant_settings (id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL,
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uk_restaurant_hours_day UNIQUE (restaurant_settings_id, day_of_week),
    CONSTRAINT ck_restaurant_hours_day CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    CONSTRAINT ck_restaurant_hours_time CHECK (
        (is_closed = TRUE AND open_time IS NULL AND close_time IS NULL)
        OR (is_closed = FALSE AND open_time IS NOT NULL AND close_time IS NOT NULL AND open_time <> close_time)
    )
);

INSERT INTO restaurant_settings (
    restaurant_name, tagline, support_email, support_phone, time_zone, currency,
    minimum_order_amount, ordering_enabled, status, delivery_radius_km, delivery_fee,
    estimated_delivery_minutes, address_line_1, city, state, postal_code, country,
    service_available, maintenance_mode, created_at, updated_at
)
SELECT
    'BurgerBurst HQ', 'Cartoon Universe Food Delivery', 'orders@burgerburst.com', '+91-90000-00000',
    'Asia/Kolkata', 'USD', 5.00, TRUE, 'OPEN', 10.00, 3.99, 30,
    'BurgerBurst Central Kitchen', 'Chennai', 'Tamil Nadu', '600001', 'India',
    TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM restaurant_settings WHERE deleted_at IS NULL);

INSERT INTO restaurant_operating_hours (
    restaurant_settings_id, day_of_week, open_time, close_time, is_closed, created_at, updated_at
)
SELECT settings.id, day_name, TIME '08:00', TIME '23:00', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM restaurant_settings settings
CROSS JOIN (VALUES
    ('MONDAY'), ('TUESDAY'), ('WEDNESDAY'), ('THURSDAY'), ('FRIDAY'), ('SATURDAY'), ('SUNDAY')
) AS days(day_name)
WHERE settings.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM restaurant_operating_hours existing
      WHERE existing.restaurant_settings_id = settings.id AND existing.day_of_week = day_name
  );
