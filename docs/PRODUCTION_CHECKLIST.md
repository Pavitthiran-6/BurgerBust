# Production readiness checklist

## Release gate

- [ ] `mvn clean verify` passes on Java 21.
- [ ] `npm ci`, `npm run lint`, and `npm run build` pass.
- [ ] V1 through V13 apply to a clean PostgreSQL database and Hibernate validation succeeds.
- [ ] No `.env`, API key, JWT, database password, OTP, or refresh token is committed or logged.
- [ ] Dependency audits were reviewed and every high/critical finding is fixed or risk-accepted with an owner/date.

## Security

- [ ] Production uses HTTPS only and the static CSP is verified in browser developer tools.
- [ ] CORS contains exact production origins and never `*`.
- [ ] JWT secret decodes to at least 256 bits and is stored only in Render secrets.
- [ ] Brevo sender domain is authenticated; OTP email delivery succeeds and failures return 503.
- [ ] Razorpay checkout and webhook signatures are tested with independent secrets.
- [ ] OTP, authentication, analytics, and general rate limits return 429 with `Retry-After`.
- [ ] Admin APIs return 403 for customers and 401 for absent/invalid access tokens.
- [ ] Suspended users cannot use protected APIs or refresh sessions.
- [ ] Swagger is disabled in `prod`; Actuator metrics require `ROLE_ADMIN`.

## Data and commerce

- [ ] Order totals, discount caps, reward redemption, delivery fee, tax, and stock changes match approved examples.
- [ ] Duplicate payment/webhook requests remain idempotent.
- [ ] Refund and cancellation state transitions are reconciled with Razorpay.
- [ ] Low-stock and pending-order dashboard figures match direct SQL spot checks.
- [ ] CSV export neutralizes spreadsheet formulas; XLSX opens with typed dates/numbers and frozen headers.
- [ ] A Supabase backup exists and a restore drill has been completed.

## Reliability and observability

- [ ] Liveness and readiness return 200; readiness fails if the restaurant database check fails.
- [ ] Prometheus metrics are scraped or an external monitor watches health, latency, 5xx rate, failed payments, pending orders, and low stock.
- [ ] JSON logs contain `requestId`; support staff can correlate a response `X-Request-Id` with logs and admin audit history.
- [ ] Alerts exist for health failure, elevated 5xx/429, email failures, payment failures, connection pool exhaustion, and low stock.
- [ ] Hikari pool size is within the Supabase connection budget across all API instances.
- [ ] The current in-memory rate limiter and OTP store are acceptable for one API instance. Before horizontal scaling, move both to Redis or another shared atomic store.

## User experience and smoke tests

- [ ] Mobile widths (360, 390, 768 px) and desktop widths load customer and admin navigation without horizontal page overflow.
- [ ] Loading, empty, validation, 401/403/404/409/422/429/500/503, and offline states are understandable.
- [ ] OTP login, menu, cart, coupon, checkout, COD, Razorpay, order tracking, rewards, notifications, and reviews complete end to end.
- [ ] Admin dashboard, customers, orders, products, inventory, coupons, broadcasts, analytics, CSV, and XLSX complete end to end.
- [ ] Browser console has no uncaught errors and CSP has no unexpected violations.

## Go-live

- [ ] DNS, TLS, CORS, CSP, webhook URL, and email sender use final domains.
- [ ] At least two administrators exist and recovery ownership is documented.
- [ ] Customer support has incident, refund, and account-suspension procedures.
- [ ] Rollback owner, previous application artifact, database restore point, and maintenance communication are ready.
