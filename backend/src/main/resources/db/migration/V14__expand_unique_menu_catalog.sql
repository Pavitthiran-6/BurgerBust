INSERT INTO categories (uuid, name, description, image_url, display_order, active, created_at, updated_at)
VALUES
    ('88888888-8888-4888-8888-888888888888', 'Sides', 'Crunchy sides and shareable bites', '/foods/home/mozzarella-sticks.png', 8, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('99999999-9999-4999-8999-999999999999', 'Wraps', 'Handheld wraps, tacos, and street-food favourites', '/foods/home/chicken-wrap.png', 9, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('10101010-1010-4010-8010-101010101010', 'Desserts', 'Sweet toon treats and sundaes', '/foods/home/waffle-sundae.png', 10, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('12121212-1212-4212-8212-121212121212', 'Salads', 'Fresh and colourful power bowls', '/foods/home/chicken-salad.png', 11, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

UPDATE products
SET image_url = '/foods/home/nuggets.png', updated_at = CURRENT_TIMESTAMP
WHERE uuid = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9';

UPDATE products
SET image_url = '/foods/home/fries.png', updated_at = CURRENT_TIMESTAMP
WHERE uuid = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10';

UPDATE products
SET image_url = '/foods/home/vanilla-shake.png', updated_at = CURRENT_TIMESTAMP
WHERE uuid = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11';

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
    ('b0000000-0000-4000-8000-000000000001', 'Pokemon Chef Combo', 'A playful chef-crafted burger, fries, and drink combo.', 15.99, 13.99, '/foods/combo_pokemon_chef.png', 'Combos', TRUE, TRUE, FALSE, TRUE, 4.80, 96, 20, 1180, FALSE),
    ('b0000000-0000-4000-8000-000000000002', 'Inferno Hero Wings', 'Crispy glazed wings with a bold fiery finish.', 8.99, 7.99, '/foods/home/wings.png', 'Fried Chicken', TRUE, TRUE, TRUE, TRUE, 4.80, 144, 16, 640, FALSE),
    ('b0000000-0000-4000-8000-000000000003', 'Dragon Fried Chicken', 'Golden crunchy chicken seasoned with mystical spices.', 9.49, NULL, '/foods/home/fried-chicken.png', 'Fried Chicken', FALSE, TRUE, TRUE, TRUE, 4.70, 121, 18, 760, FALSE),
    ('b0000000-0000-4000-8000-000000000004', 'Midnight Tacos', 'Three loaded tacos with fresh salsa and zesty sauce.', 7.99, NULL, '/foods/home/tacos.png', 'Wraps', FALSE, TRUE, FALSE, TRUE, 4.60, 73, 12, 540, FALSE),
    ('b0000000-0000-4000-8000-000000000005', 'Hero Chicken Wrap', 'Grilled chicken and crisp vegetables wrapped for action.', 7.49, 6.99, '/foods/home/chicken-wrap.png', 'Wraps', FALSE, TRUE, FALSE, TRUE, 4.70, 82, 11, 510, FALSE),
    ('b0000000-0000-4000-8000-000000000006', 'Shawarma Scroll', 'Spiced chicken shawarma rolled with vegetables and garlic sauce.', 7.99, NULL, '/foods/home/shawarma.png', 'Wraps', TRUE, FALSE, FALSE, TRUE, 4.70, 105, 13, 570, FALSE),
    ('b0000000-0000-4000-8000-000000000007', 'Boom Hot Dog', 'A juicy grilled hot dog with bright toon toppings.', 5.99, NULL, '/foods/home/hot-dog.png', 'Wraps', FALSE, FALSE, FALSE, TRUE, 4.50, 64, 8, 460, FALSE),
    ('b0000000-0000-4000-8000-000000000008', 'Crispy Hero Sandwich', 'Crunchy chicken, crisp lettuce, and creamy hero sauce.', 8.49, 7.49, '/foods/home/chicken-sandwich.png', 'Burger', TRUE, TRUE, TRUE, TRUE, 4.80, 132, 14, 690, FALSE),
    ('b0000000-0000-4000-8000-000000000009', 'Pink Power Donut', 'A fluffy glazed donut finished with colourful sprinkles.', 3.49, NULL, '/foods/home/donut.png', 'Desserts', FALSE, TRUE, FALSE, TRUE, 4.70, 91, 4, 310, TRUE),
    ('b0000000-0000-4000-8000-000000000010', 'Fudge Brownie Stack', 'Rich chocolate brownies stacked with glossy fudge.', 4.49, NULL, '/foods/home/brownie.png', 'Desserts', FALSE, TRUE, TRUE, TRUE, 4.80, 118, 5, 480, TRUE),
    ('b0000000-0000-4000-8000-000000000011', 'Strawberry Power Shake', 'A creamy strawberry shake crowned with whipped cream.', 4.49, NULL, '/foods/home/strawberry-shake.png', 'Drinks', TRUE, TRUE, FALSE, TRUE, 4.80, 139, 4, 420, TRUE),
    ('b0000000-0000-4000-8000-000000000012', 'Toon Cola', 'An icy sparkling cola made for heroic thirst.', 2.49, NULL, '/foods/home/soft-drink.png', 'Drinks', FALSE, FALSE, FALSE, TRUE, 4.40, 67, 2, 180, TRUE),
    ('b0000000-0000-4000-8000-000000000013', 'Loaded Power Nachos', 'Crunchy chips loaded with cheese, salsa, and jalapenos.', 6.99, 5.99, '/foods/home/loaded-nachos.png', 'Sides', TRUE, TRUE, TRUE, TRUE, 4.80, 103, 9, 590, TRUE),
    ('b0000000-0000-4000-8000-000000000014', 'Stretchy Mozzarella Sticks', 'Golden mozzarella sticks with an epic cheese pull.', 5.99, NULL, '/foods/home/mozzarella-sticks.png', 'Sides', FALSE, TRUE, FALSE, TRUE, 4.70, 86, 8, 490, TRUE),
    ('b0000000-0000-4000-8000-000000000015', 'Hero Chicken Salad', 'Grilled chicken, crisp greens, tomatoes, and crunchy vegetables.', 8.99, 7.99, '/foods/home/chicken-salad.png', 'Salads', TRUE, TRUE, FALSE, TRUE, 4.70, 77, 10, 430, FALSE),
    ('b0000000-0000-4000-8000-000000000016', 'Crispy Fish Hero Burger', 'Crispy fish, cool slaw, and punchy tartar sauce in a soft bun.', 8.99, NULL, '/foods/home/fish-burger.png', 'Burger', TRUE, TRUE, TRUE, TRUE, 4.80, 112, 14, 650, FALSE),
    ('b0000000-0000-4000-8000-000000000017', 'Strawberry Waffle Sundae', 'Golden waffle, strawberry ice cream, berries, and syrup.', 6.49, 5.99, '/foods/home/waffle-sundae.png', 'Desserts', TRUE, TRUE, TRUE, TRUE, 4.90, 126, 8, 610, TRUE),
    ('b0000000-0000-4000-8000-000000000018', 'Golden Onion Rings', 'Crispy golden onion rings with a crunchy seasoned coating.', 4.49, NULL, '/foods/home/onion-rings.png', 'Sides', FALSE, TRUE, FALSE, TRUE, 4.60, 94, 7, 390, TRUE),
    ('b0000000-0000-4000-8000-000000000019', 'Mystic Iced Coffee', 'Chilled creamy coffee with ice and a smooth foam crown.', 3.99, NULL, '/foods/home/iced-coffee.png', 'Drinks', FALSE, TRUE, FALSE, TRUE, 4.70, 88, 3, 240, TRUE)
) AS values_table(
    uuid, name, description, price, offer_price, image_url, category_name,
    featured, recommended, best_seller, popular, rating, review_count,
    preparation_time, calories, veg
)
JOIN categories category ON category.name = values_table.category_name AND category.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold, visible, created_at, updated_at)
SELECT product.id, 100, 10, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM products product
LEFT JOIN inventory ON inventory.product_id = product.id
WHERE product.deleted_at IS NULL AND inventory.id IS NULL
ON CONFLICT (product_id) DO NOTHING;
