# Phase 5 API reference

Every endpoint below is documented in development Swagger. Except for the anonymous analytics collector, Phase 5 endpoints require `Authorization: Bearer ACCESS_TOKEN` and `ROLE_ADMIN`. JSON endpoints retain the existing `ApiResponse` envelope. Report downloads intentionally return file bytes with `Content-Disposition`.

## Dashboard and analytics

- `GET /api/v1/admin/dashboard` — revenue/order summaries, daily/weekly/monthly sales, active customers, best sellers, low stock, pending orders, status distribution, reviews, coupon/reward statistics, and recent audit activity.
- `GET /api/v1/admin/analytics?from=...&to=...` — revenue series, peak hours, customer growth, funnel, products, and categories for a bounded UTC range.
- `POST /api/v1/analytics/events` — records a whitelisted, privacy-minimized funnel event. Product events require a product UUID.

## Management

- `GET /api/v1/admin/customers`, `GET /api/v1/admin/customers/{id}` — paged search/filter and customer summary.
- `PATCH /api/v1/admin/customers/{id}/status` — suspend/activate; suspension revokes refresh tokens.
- `GET /api/v1/admin/customers/{id}/orders` — customer order history.
- `GET /api/v1/admin/orders`, `GET /api/v1/admin/orders/{id}` — admin order queue/details.
- `PATCH /api/v1/admin/orders/{id}/status` — validated status transition.
- `GET /api/v1/admin/products` — search including unavailable/hidden products.
- `PATCH /api/v1/admin/products/bulk` — up to 200 product availability, visibility, merchandising, or category updates.
- `DELETE /api/v1/admin/products/bulk` — soft-delete up to 200 products.
- `PATCH /api/v1/admin/inventory/{productId}/adjust` — atomic positive/negative stock adjustment with a mandatory reason; stock cannot become negative.
- `GET|POST /api/v1/admin/coupons`, `PUT /api/v1/admin/coupons/{id}`, `PATCH /api/v1/admin/coupons/{id}/expire` — coupon lifecycle and usage analytics.
- `POST /api/v1/admin/notifications/broadcast` — sends an in-app broadcast to active customers.
- `GET /api/v1/admin/notifications/broadcasts` — paged broadcast history and recipient counts.

Existing category, restaurant, payment-refund, and individual product/inventory endpoints remain available and are shown in Swagger.

## Reports

`GET /api/v1/admin/reports/{type}?format={format}&from={instant}&to={instant}`

- `type`: `SALES`, `PRODUCTS`, `CUSTOMERS`, `INVENTORY`, or `PAYMENTS`.
- `format`: `CSV` or `XLSX`.
- `from`/`to`: ISO-8601 UTC instants; the range must be positive and no more than two years.

CSV is UTF-8 with a BOM and protects formula-leading values. XLSX uses real numeric/date/boolean cells, currency formats, filters, widths, and a frozen header row.

## Operational endpoints

- `GET /actuator/health/liveness` — public process liveness.
- `GET /actuator/health/readiness` — public readiness including database/restaurant connectivity.
- `GET /actuator/prometheus`, `GET /actuator/metrics`, `GET /actuator/info` — administrator-only in the security chain (health remains public).

Mutating admin controller calls produce an `admin_audit_events` record containing actor, operation, resource, result, request ID, duration, and timestamp. Sensitive request bodies and tokens are never stored in that audit table.
