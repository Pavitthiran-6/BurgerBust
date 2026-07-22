CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    description VARCHAR(2000),
    price NUMERIC(12, 2) NOT NULL,
    offer_price NUMERIC(12, 2),
    image_url VARCHAR(1000),
    category_id BIGINT NOT NULL REFERENCES categories (id),
    available BOOLEAN NOT NULL DEFAULT TRUE,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    recommended BOOLEAN NOT NULL DEFAULT FALSE,
    best_seller BOOLEAN NOT NULL DEFAULT FALSE,
    popular BOOLEAN NOT NULL DEFAULT FALSE,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    preparation_time INTEGER NOT NULL DEFAULT 15,
    calories INTEGER,
    veg BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT ck_products_price CHECK (price >= 0),
    CONSTRAINT ck_products_offer_price CHECK (offer_price IS NULL OR (offer_price >= 0 AND offer_price <= price)),
    CONSTRAINT ck_products_rating CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT ck_products_review_count CHECK (review_count >= 0),
    CONSTRAINT ck_products_preparation_time CHECK (preparation_time > 0),
    CONSTRAINT ck_products_calories CHECK (calories IS NULL OR calories >= 0)
);

CREATE UNIQUE INDEX uk_products_active_name ON products (LOWER(name)) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_public ON products (category_id, created_at DESC) WHERE deleted_at IS NULL AND visible = TRUE AND available = TRUE;
CREATE INDEX idx_products_featured ON products (featured) WHERE deleted_at IS NULL AND visible = TRUE AND available = TRUE;

INSERT INTO products (
    uuid, name, description, price, offer_price, image_url, category_id,
    available, visible, featured, recommended, best_seller, popular,
    rating, review_count, preparation_time, calories, veg, created_at, updated_at
)
SELECT values_table.uuid::UUID, values_table.name, values_table.description, values_table.price,
       values_table.offer_price, values_table.image_url, category.id,
       TRUE, TRUE, values_table.featured, values_table.recommended, values_table.best_seller,
       values_table.popular, values_table.rating, values_table.review_count,
       values_table.preparation_time, values_table.calories, values_table.veg,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'The Classic Toon', 'Our signature burger with a spicy kick.', 8.99, 7.99, '/foods/burger-classic.png', 'Burger', TRUE, TRUE, TRUE, TRUE, 4.80, 128, 10, 650, FALSE),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Cheesy Chibi Burger', 'Mini patty topped with giant melty cheese.', 7.49, NULL, '/foods/burger-chibi.png', 'Burger', FALSE, TRUE, FALSE, FALSE, 4.50, 54, 8, 520, FALSE),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'Cheesy Pal Pizza', 'Classic cheese pizza with extra gooey mozzarella.', 4.99, 4.49, '/foods/pizza-cheesy.png', 'Pizza', TRUE, TRUE, TRUE, TRUE, 4.90, 203, 15, 720, TRUE),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'Happy Pepperoni Pizza', 'Loaded with spicy pepperoni cups.', 5.99, NULL, '/foods/pizza-pepperoni.png', 'Pizza', FALSE, FALSE, FALSE, TRUE, 4.80, 177, 16, 830, FALSE),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'Toon-tastic Pasta', 'Rich tomato marinara over spiral pasta.', 9.99, NULL, '/foods/pasta-tomato.png', 'Pasta', FALSE, TRUE, FALSE, FALSE, 4.60, 42, 14, 610, TRUE),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'Burger Boss Combo', 'Burger, crispy fries and a chilled drink.', 12.99, 10.99, '/foods/burger-boss.png', 'Combos', TRUE, TRUE, TRUE, TRUE, 4.90, 241, 18, 980, FALSE),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa7', 'Adventurer Combo', 'A complete meal built for hungry adventurers.', 14.99, 12.99, '/foods/combo_adventurer.png', 'Combos', TRUE, FALSE, FALSE, TRUE, 4.70, 119, 20, 1100, FALSE),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa8', 'Titans Party Combo', 'A shareable feast for the whole squad.', 24.99, 21.99, '/foods/combo_titans_party.png', 'Combos', TRUE, TRUE, TRUE, TRUE, 4.90, 310, 25, 2200, FALSE),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9', 'Boom Boom Popcorn', 'Crunchy bite-sized chicken pops.', 6.99, NULL, '/foods/burger-boss.png', 'Fried Chicken', FALSE, TRUE, FALSE, FALSE, 4.70, 88, 10, 430, FALSE),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10', 'Happy Fries', 'Crispy golden sidekick fries.', 2.99, NULL, '/foods/burger-chibi.png', 'Fries', FALSE, TRUE, FALSE, TRUE, 4.60, 312, 5, 320, TRUE),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11', 'Sunny Shake', 'A bright vanilla shake with a cherry on top.', 3.50, NULL, '/foods/combo_adventurer.png', 'Drinks', FALSE, TRUE, FALSE, TRUE, 4.70, 156, 4, 390, TRUE)
) AS values_table(
    uuid, name, description, price, offer_price, image_url, category_name,
    featured, recommended, best_seller, popular, rating, review_count,
    preparation_time, calories, veg
)
JOIN categories category ON category.name = values_table.category_name AND category.deleted_at IS NULL
ON CONFLICT (uuid) DO NOTHING;
