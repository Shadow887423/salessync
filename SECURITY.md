# Security Policy & Hardening Standards — SalesSync

SalesSync is engineered with defense-in-depth principles to protect data integrity, prevent unauthorized system manipulation, and eliminate common attack vectors defined by the **OWASP Top 10**.

---

## 🛡️ Security Architecture & Hardening Overview

### 1. Database Security & SQL Injection Prevention
- **Native Prepared Statements**: Emulated prepares are strictly disabled (`PDO::ATTR_EMULATE_PREPARES => false`) in `config/database.php`. Every query parameter is sent out-of-band via binary protocol bindings, mathematically eliminating SQL injection.
- **Strict SQL Mode**: MySQL strict mode (`'strict' => true`) is enforced, preventing silent data truncation, implicit invalid type coercion, and illegal group by queries.
- **Least-Privilege Database User**: Production installations use a dedicated non-root user (`salessync_app`) granted only `SELECT`, `INSERT`, `UPDATE`, and `DELETE`. Administrative privileges (`DROP DATABASE`, `ALTER TABLE`, `FILE`, `GRANT`) are revoked.
- **Check Constraints**: Database table level constraints (`chk_sales_value_positive`) enforce positive monetary amounts directly in the engine storage layer.
- **Atomic Transactions**: All mutations in `DataController` execute inside `DB::transaction()` blocks to prevent inconsistent partial states.

### 2. Cross-Site Scripting (XSS) & DOM Injection Prevention
- **Multi-Stage Sanitization**:
  - `StoreDataRequest` executes input sanitization in `prepareForValidation()`, stripping NULL bytes (`\0`), control characters, and all HTML/PHP tags via `strip_tags()`.
  - Eloquent model mutators in `DataRecord` sanitize attributes before persistence.
  - Category inputs are restricted via strict Unicode regex (`/^[\pL\s\d\-&,'()\/]+$/u`).
- **DOM Attribute Breakout Protection**:
  - The client-side `escapeHtml()` function in `dashboard.js` performs comprehensive 5-character entity conversion (`&`, `<`, `>`, `"`, `'`). This neutralizes attribute breakout attacks in dynamic table templates.
- **Blade Automatic Escaping**: All server-rendered variables use Blade's double curly syntax `{{ ... }}` which executes `htmlspecialchars(..., ENT_QUOTES, 'UTF-8')`.

### 3. Rate Limiting & Denial of Service (DoS) Defense
- **Dynamic API Throttling**:
  - `throttle:api`: Limits read operations (`GET /api/chart-data`) to **60 requests per minute** per client IP.
  - `throttle:api-write`: Limits write operations (`POST`, `PUT`, `DELETE /api/records`) to **30 requests per minute** per client IP.
- **Strict Route Model Binding & Regex Constraints**:
  - Primary keys are constrained to numeric values (`->whereNumber('dataRecord')`), rejecting path traversal attempts and malformed inputs at the routing tier before invoking the database.

### 4. HTTP Security Headers & Clickjacking Prevention
The `SecurityHeaders` middleware enforces:
- `Content-Security-Policy (CSP)`: Disallows arbitrary external scripts; restricts script and style origins to self and trusted CDNs (jsDelivr, Google Fonts).
- `X-Frame-Options: SAMEORIGIN`: Prevents framing and clickjacking attacks.
- `X-Content-Type-Options: nosniff`: Stops browsers from MIME-sniffing away from the declared content type.
- `Referrer-Policy: strict-origin-when-cross-origin`: Restricts sensitive referrers from leaking to third-party domains.
- `Permissions-Policy`: Shuts down access to camera, microphone, geolocation, and payment hardware.
- `Strict-Transport-Security (HSTS)`: Enforces TLS/HTTPS encryption with `max-age=31536000; includeSubDomains; preload`.

### 5. Session Security & Cookie Theft Prevention
- `http_only => true`: Prevents client-side scripts from reading session cookies.
- `same_site => 'lax'`: Mitigates Cross-Site Request Forgery (CSRF).
- `secure => true`: Enforces cookie transmission over HTTPS in production.
- `dontFlash`: Sensitive inputs (`password`, `token`, `secret`) are excluded from session flash storage.

### 6. Information Disclosure & Error Shielding
- `APP_DEBUG=false` in production suppresses internal stack traces, database schema details, and credentials.
- Controller catch blocks intercept runtime exceptions, log them securely via Laravel's logging pipeline, and return sanitized generic error payloads (`Unable to process request`).
- Nginx blocks direct access to hidden files (`.env`, `.git`) and framework code directories (`/app`, `/database`, `/storage/logs`).

---

## 🔒 Production Security Checklist

Prior to public deployment:
1. [ ] Generate a production application key: `php artisan key:generate`.
2. [ ] Confirm `APP_ENV=production` and `APP_DEBUG=false` in `.env`.
3. [ ] Configure dedicated database credentials with non-root privileges.
4. [ ] Ensure TLS/HTTPS is active with a valid SSL certificate (e.g. Let's Encrypt).
5. [ ] Restrict `CORS_ALLOWED_ORIGINS` to your domain.
6. [ ] Cache framework configurations: `php artisan config:cache && php artisan route:cache && php artisan view:cache`.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within SalesSync, please do **NOT** open a public issue. Send a detailed report to:

- **Email**: `security@salessync.local`
- **Response SLA**: Within 48 hours
- **Fix SLA**: Within 7 business days for critical vulnerabilities
