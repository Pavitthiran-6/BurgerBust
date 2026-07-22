CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    image_url VARCHAR(1000),
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT ck_categories_display_order CHECK (display_order >= 0)
);

CREATE UNIQUE INDEX uk_categories_active_name ON categories (LOWER(name)) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_public_order ON categories (display_order, name) WHERE deleted_at IS NULL AND active = TRUE;

INSERT INTO categories (uuid, name, description, image_url, display_order, active, created_at, updated_at)
VALUES
    ('11111111-1111-4111-8111-111111111111', 'Burger', 'Signature toon burgers', '/foods/burger-classic.png', 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('22222222-2222-4222-8222-222222222222', 'Pizza', 'Cheesy pizzas and slices', '/foods/pizza-cheesy.png', 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('33333333-3333-4333-8333-333333333333', 'Pasta', 'Comforting pasta bowls', '/foods/pasta-tomato.png', 3, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('44444444-4444-4444-8444-444444444444', 'Fried Chicken', 'Crunchy chicken favourites', '/foods/burger-boss.png', 4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('55555555-5555-4555-8555-555555555555', 'Fries', 'Crispy sides and fries', '/foods/burger-chibi.png', 5, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('66666666-6666-4666-8666-666666666666', 'Drinks', 'Shakes and refreshing drinks', '/foods/combo_adventurer.png', 6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('77777777-7777-4777-8777-777777777777', 'Combos', 'Complete BurgerBurst meals', '/foods/combo_titans_party.png', 7, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (uuid) DO NOTHING;
