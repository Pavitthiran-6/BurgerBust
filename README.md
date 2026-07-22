# BurgerBurst

BurgerBurst is a React/Vite storefront backed by a Java 21 and Spring Boot API. It includes the complete customer commerce journey plus a production admin console, analytics dashboards, bulk catalog/inventory management, customer administration, broadcasts, and CSV/XLSX reports.

## Run locally

Start the backend from `backend` after configuring its environment variables:

```powershell
mvn spring-boot:run
```

Start the frontend from the project root:

```powershell
$env:VITE_API_BASE_URL = 'http://localhost:8080/api/v1'
npm install
npm run dev
```

The frontend defaults to `http://localhost:8080/api/v1` when `VITE_API_BASE_URL` is not set.

Razorpay checkout requires `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in the backend environment. When credentials are absent, payment creation fails safely and COD remains available.

## Verification

```powershell
cd backend
mvn clean verify

cd ..
npm run lint
npm run build
```

Useful development URLs:

- Frontend: `http://localhost:5173`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health: `http://localhost:8080/actuator/health`

Swagger is disabled under the backend `prod` profile.

## Production

Use [render.yaml](render.yaml) to deploy the Docker API and static frontend. Production setup, database recovery, API additions, and the release gate are documented in:

- [Deployment guide](docs/DEPLOYMENT.md)
- [Database operations](docs/DATABASE_OPERATIONS.md)
- [Phase 5 API](docs/API_PHASE5.md)
- [Production checklist](docs/PRODUCTION_CHECKLIST.md)
- [Security review](docs/SECURITY_REVIEW.md)
