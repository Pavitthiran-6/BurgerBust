# BurgerBurst deployment guide

The repository includes a Render Blueprint at `render.yaml`. It creates a Docker-based Spring Boot web service in Singapore and a Vite static site. The API uses the production profile, Flyway runs automatically during startup, and Render checks `/actuator/health/readiness` before routing traffic.

## 1. Prepare external services

1. Create a Supabase PostgreSQL project in the same or nearest available region.
2. Copy its direct JDBC connection details. Use a JDBC URL such as `jdbc:postgresql://HOST:5432/postgres?sslmode=require`; do not paste the browser-oriented `postgresql://` URI into `DATABASE_URL`.
3. In Brevo, authenticate a sending domain and register the exact sender used by `EMAIL_SENDER_EMAIL`.
4. Create Razorpay live credentials and a separate webhook secret. Configure the webhook URL as `https://API_HOST/api/v1/payments/webhook`.
5. Put the repository in GitHub or GitLab. Never commit `.env` files or production credentials.

## 2. Create the Render Blueprint

1. In Render, create a Blueprint from the repository. Render reads `render.yaml`.
2. Enter every value marked `sync: false`:

   - `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
   - `BREVO_API_KEY`, `EMAIL_SENDER_EMAIL`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

3. Keep the generated `JWT_SECRET`. Render generates a Base64-encoded 256-bit value, which satisfies the backend minimum.
4. Deploy the API first, then the static site if Render does not resolve the cross-service host references in a single pass.

The Blueprint derives `VITE_API_HOST` from the API service and the API's CORS origin from the frontend service. For custom domains, set `VITE_API_BASE_URL=https://API_CUSTOM_DOMAIN/api/v1`, set `CORS_ALLOWED_ORIGINS` to the exact frontend HTTPS origin, and add the API custom origin to the frontend `connect-src` CSP in `render.yaml`. Multiple CORS origins are comma-separated and must never contain `*`.

## 3. Verify the release

Run these checks after every production deployment:

```text
GET https://API_HOST/actuator/health/liveness
GET https://API_HOST/actuator/health/readiness
GET https://API_HOST/api/v1/restaurant
GET https://WEB_HOST/
GET https://WEB_HOST/admin
```

Expected results:

- both health probes return HTTP 200 and `UP`;
- the restaurant endpoint returns the standard `ApiResponse` envelope;
- the frontend and direct `/admin` URL load without a 404;
- Swagger and `/v3/api-docs` are unavailable in the production profile;
- an OTP reaches a real mailbox through Brevo without appearing in application logs;
- an admin can load the dashboard and download one CSV and one XLSX report;
- a Razorpay sandbox/live test payment and signed webhook complete once.

## Environment reference

| Variable | Required | Purpose |
|---|---:|---|
| `SPRING_PROFILES_ACTIVE=prod` | yes | Disables Swagger, requires TLS database connections, enables production logging. |
| `DATABASE_URL` | yes | PostgreSQL JDBC URL with `sslmode=require`. |
| `DATABASE_USERNAME`, `DATABASE_PASSWORD` | yes | Least-privilege application database credentials. |
| `JWT_SECRET` | yes | Base64 encoding of at least 32 random bytes. Rotating it signs out every session. |
| `CORS_ALLOWED_ORIGINS` | yes | Exact frontend host(s); bare Render hosts are normalized to HTTPS. |
| `EMAIL_PROVIDER=brevo` | yes | Activates real transactional OTP delivery. |
| `BREVO_API_KEY`, `EMAIL_SENDER_EMAIL` | yes | Brevo credential and verified sender. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | for online payment | Provider credentials. |
| `RAZORPAY_WEBHOOK_SECRET` | for online payment | Independent webhook signing secret. |
| `DB_MAX_POOL_SIZE`, `DB_MIN_IDLE` | optional | Hikari pool sizing; Blueprint defaults to 8/2. |
| `RATE_LIMIT_*` | optional | Fixed-window request limits. Defaults are in `application.properties`. |

## Rollback

Application rollback and database rollback are separate operations. Redeploy the previous application artifact only when its schema remains compatible with every applied Flyway migration. Database migrations are forward-only; restore a tested Supabase backup into a new project for destructive data rollback, then point the API at that project during a maintenance window. See `DATABASE_OPERATIONS.md`.
