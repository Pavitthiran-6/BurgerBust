# BurgerBurst backend - Phase 5

Java 21 / Spring Boot API for BurgerBurst. The backend includes authentication, restaurant, menu, inventory, commerce, payment, notification/review, administration, analytics, reporting, auditing, and production observability.

## Prerequisites

- Java 21
- Maven 3.9+
- PostgreSQL (local or Supabase); H2 is not supported

## Local configuration

Set the required environment variables in PowerShell:

```powershell
$env:SPRING_PROFILES_ACTIVE = 'local'
$env:DATABASE_URL = 'jdbc:postgresql://YOUR_HOST:5432/postgres?sslmode=require'
$env:DATABASE_USERNAME = 'YOUR_DATABASE_USER'
$env:DATABASE_PASSWORD = 'YOUR_DATABASE_PASSWORD'
$env:JWT_SECRET = 'YOUR_BASE64_ENCODED_32_BYTE_OR_LONGER_SECRET'
$env:CORS_ALLOWED_ORIGINS = 'http://localhost:5173'
$env:RAZORPAY_KEY_ID = 'rzp_test_or_live_key'
$env:RAZORPAY_KEY_SECRET = 'YOUR_RAZORPAY_KEY_SECRET'
$env:RAZORPAY_WEBHOOK_SECRET = 'YOUR_RAZORPAY_WEBHOOK_SECRET'
```

Generate a suitable JWT secret without storing it in the repository:

```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

## Build and run

```powershell
mvn clean verify
mvn spring-boot:run
```

Flyway applies migrations V1 through V13 before Hibernate validates the PostgreSQL schema.

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Health: `http://localhost:8080/actuator/health`

Swagger and OpenAPI are disabled under the `prod` profile.

## Authentication endpoints

- `POST /api/v1/auth/send-otp`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout` (access token required)
- `POST /api/v1/auth/logout-all` (access token required)
- `GET /api/v1/users/me` (access token required)

Refresh tokens rotate on refresh. Logout revokes the supplied refresh token, while logout-all revokes every active refresh token owned by the authenticated user. Access tokens remain valid until their seven-day expiry and must be discarded by clients after logout.

## Phase 3 endpoints

Public endpoints:

- `GET /api/v1/restaurant`
- `GET /api/v1/categories`
- `GET /api/v1/categories/{id}`
- `GET /api/v1/products`
- `GET /api/v1/products/{id}`
- `GET /api/v1/products/search`
- `GET /api/v1/products/featured`
- `GET /api/v1/products/recommended`
- `GET /api/v1/products/popular`

Administrator endpoints require an authenticated `ROLE_ADMIN` user:

- `PUT /api/v1/admin/restaurant`
- `PATCH /api/v1/admin/restaurant/status`
- `POST /api/v1/admin/categories`
- `PUT /api/v1/admin/categories/{id}`
- `DELETE /api/v1/admin/categories/{id}`
- `PATCH /api/v1/admin/categories/{id}/status`
- `POST /api/v1/admin/products`
- `PUT /api/v1/admin/products/{id}`
- `DELETE /api/v1/admin/products/{id}`
- `PATCH /api/v1/admin/products/{id}/restore`
- `GET /api/v1/admin/inventory`
- `PUT /api/v1/admin/inventory/{productId}`
- `PATCH /api/v1/admin/inventory/{productId}/stock`

Product listing and search support pagination, sorting, category, price, dietary, availability, and merchandising filters. Inventory updates record history and automatically synchronize product availability when stock reaches zero.

## Phase 4 endpoints

Authenticated customer endpoints:

- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PUT /api/v1/cart/items/{itemId}`
- `DELETE /api/v1/cart/items/{itemId}`
- `DELETE /api/v1/cart`
- `POST /api/v1/cart/coupon`
- `DELETE /api/v1/cart/coupon`
- `GET /api/v1/rewards`
- `GET /api/v1/rewards/history`
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{id}`
- `POST /api/v1/orders/{id}/cancel`
- `POST /api/v1/orders/{id}/reorder`
- `POST /api/v1/payments/create-order`
- `POST /api/v1/payments/verify`
- `GET /api/v1/payments/{orderId}`
- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/{id}/read`
- `POST /api/v1/reviews`
- `PUT /api/v1/reviews/{id}`
- `DELETE /api/v1/reviews/{id}`

Public and signed-provider endpoints:

- `GET /api/v1/products/{id}/reviews`
- `POST /api/v1/payments/webhook` (Razorpay signature required)

Administrator endpoints:

- `PATCH /api/v1/admin/orders/{id}/status`
- `POST /api/v1/admin/payments/{paymentId}/refund`

Phase 5 administrator endpoints and report formats are listed in [`../docs/API_PHASE5.md`](../docs/API_PHASE5.md). Deployment and operations are covered by [`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md).

All totals are calculated from current server-side product, inventory, restaurant, coupon, and reward data. Order items and delivery details are snapshotted at checkout. Razorpay checkout signatures and raw webhook bodies are verified with HMAC-SHA256; provider order creation is idempotent and refresh/payment tokens are not stored in plaintext.

## Database migrations

- V1: foundation schema
- V2: user last-login tracking
- V3: restaurant settings and operating hours
- V4: categories
- V5: products
- V6: inventory and inventory history
- V7: carts and cart items
- V8: coupons and reward ledger
- V9: orders, items, status history, and coupon redemption
- V10: payments, webhook idempotency, and payment audit trail
- V11: notifications and reviews
- V12: order reservation and cancellation inventory-history types
- V13: admin analytics/audit/broadcast tables and production query indexes

The in-memory OTP cache is process-local and does not survive restarts. Local mode may log generated OTPs for development; production never logs OTP values or tokens.
