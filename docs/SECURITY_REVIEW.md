# Phase 5 security review

Reviewed areas: authentication filters, authorization annotations, CORS, response headers, request validation, OTP abuse controls, payment/webhook signing, exports, error responses, secret handling, logs, and dependencies.

## Controls in place

- JWT secrets must decode to at least 256 bits. Invalid, expired, or wrongly signed access tokens return 401; inactive accounts are denied with 403.
- Every admin controller uses `ROLE_ADMIN` method authorization. Customer suspension revokes refresh tokens, and admin mutations create audit events without storing request bodies or tokens.
- Refresh tokens are SHA-256 hashed, rotated, revocable, and checked for user activity. Existing access tokens remain valid until expiry by documented design.
- CORS credentials are allowed only for configured explicit origins; wildcard origins fail configuration validation.
- OTP endpoints have cooldown/attempt controls plus an outer request rate limit. Authentication, analytics, and general API traffic have separate limits.
- Jakarta Validation covers request DTO boundaries; malformed bodies/types return generic 400 responses. Database constraints and service rules provide a second layer.
- Razorpay payment and webhook signatures use HMAC verification and constant-time comparison. Provider creation and webhook processing are idempotent.
- CSV exports prefix formula-leading cells, and XLSX exports write user content as inline strings rather than formulas.
- Production emits structured JSON with request correlation IDs. OTPs are never logged in production.
- The Render frontend policy includes CSP, HSTS, frame denial, MIME sniffing protection, referrer policy, permissions policy, and popup-compatible cross-origin isolation for Razorpay.
- Swagger is disabled in production. Health is public; detailed metrics and Prometheus endpoints require an administrator token.

## Cookie and browser-token review

The current API is a bearer-token API and does not issue authentication cookies, so `Secure`, `HttpOnly`, and `SameSite` cookie flags are not applicable. The React client currently persists access and refresh tokens in local storage. CSP reduces—but cannot eliminate—the impact of an XSS flaw. A future higher-assurance design should move the refresh token to a `Secure; HttpOnly; SameSite` cookie, keep access tokens only in memory, add CSRF protection to cookie-authenticated endpoints, and shorten the seven-day access-token lifetime.

## Scaling limitations

The rate-limit windows and OTP cache are process-local. This is correct for the single API instance declared in `render.yaml`; horizontal scaling would allow per-instance limits and lose OTP state during restarts. Move both to an atomic shared Redis store before adding instances. Redis response caching was intentionally not added because the public menu already has explicit HTTP cache headers and invalidation correctness matters more than marginal database savings at the current scale.

## Dependency audit

- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities on 2026-07-21.
- Java dependencies: the local OWASP Dependency-Check run is **inconclusive**, not clean. Its first public NVD synchronization did not finish after 30 minutes, and a follow-up offline-cache scan did not produce a report within three minutes. Run `mvn org.owasp:dependency-check-maven:12.2.2:check -DfailBuildOnCVSS=7` in CI with a reliable NVD mirror/API key and review the generated report before release.

No penetration test or external infrastructure assessment is implied by this code-level review.
