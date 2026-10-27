# SalesSync — Form-Connected Dashboard with Real-Time Chart Updates

[![CI Pipeline](https://github.com/your-username/salessync/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/salessync/actions/workflows/ci.yml)
[![PHP Version](https://img.shields.io/badge/PHP-8.1%20%7C%208.2-777BB4.svg?logo=php)](https://www.php.net/)
[![Laravel Version](https://img.shields.io/badge/Laravel-10.x-FF2D20.svg?logo=laravel)](https://laravel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Security Policy](https://img.shields.io/badge/Security-Hardened%20(OWASP)-success.svg)](SECURITY.md)

SalesSync is an enterprise-grade, responsive sales dashboard web application featuring a form connected to live Chart.js visualizations. Any CRUD operation (Create, Read, Update, Delete) dynamically synchronizes the charts, summary metric cards, and data records table in real time without a page refresh.

Engineered with **defense-in-depth security** to prevent hacking, SQL injection, XSS, CSRF, and DoS attacks, and pre-configured for **instant GitHub deployment** with automated CI/CD and Docker containerization.

---

## 🌟 Key Features

- **Real-Time Dynamic Charting**:
  - Automatically updates bar, line, and pie charts on add, edit, or delete operations with fluid 750ms animated transitions.
  - Multi-mode view: switch between **Bar Chart** (category revenue), **Line Chart** (chronological trend), and **Doughnut/Pie Chart** (percentage distribution).
  - Custom tooltips formatted as currency (`$X,XXX.XX`) and percentages.
  - Interactive empty and loading states.
- **Form Management & Input Hardening**:
  - Category selector with instant "Other" custom category input toggle.
  - Real-time input validation: positive amounts, max date (cannot be future), and live character counter for descriptions (1000 char max).
  - Mode switching: seamless transition from **Add Mode** to **Edit Mode** with inline table row highlighting and cancel capability.
- **Live Summary Metric Cards**:
  - **Total Records**, **Total Revenue**, **Average Sale**, and **Top Category** metric cards with smooth counting-number animations.
- **Interactive Records Table**:
  - Live client-side search by category and description.
  - Category dropdown filter and start/end date range filters.
  - Real-time row count badge and dynamic visible total recalculation.
  - Styled category badges and modal delete confirmation dialog.
- **Dual Persistence Architecture**:
  - **Backend Mode**: Built on Laravel 10 / PHP 8.1+ with Eloquent ORM, prepared SQL statements, SQLite, and MySQL support.
  - **Zero-Dependency Frontend / Local Mode**: Seamless fallback to `localStorage` when testing statically (`public/index.html`) without a PHP server.

---

## 🛡️ Anti-Hacking & Security Hardening Architecture

SalesSync is fortified at all application layers to prevent unauthorized intrusion, data corruption, and data exfiltration:

### 1. Database Security & Anti-SQL-Injection
- **Enforced Native Prepared Statements**: `PDO::ATTR_EMULATE_PREPARES => false` in `config/database.php` guarantees MySQL evaluates all parameters out-of-band, completely eliminating SQL injection vectors.
- **Strict SQL Mode**: Prohibits implicit data truncation, invalid date insertion, or ambiguous column grouping.
- **Least-Privilege Database User**: Script provided in `database/schema.sql` creates a dedicated `salessync_app` user with only `SELECT`, `INSERT`, `UPDATE`, and `DELETE`. Administrative permissions (`DROP DATABASE`, `ALTER TABLE`, `FILE`, `GRANT`) are withheld.
- **Storage-Level Check Constraints**: Database level `chk_sales_value_positive` constraint blocks negative or overflow values at the disk engine layer.
- **Atomic Database Transactions**: All writes in `DataController` execute inside `DB::transaction()` blocks to prevent inconsistent partial states.

### 2. Cross-Site Scripting (XSS) & DOM Injection Prevention
- **Multi-Stage Sanitization**:
  - `StoreDataRequest` scrubs NULL bytes (`\0`), control characters, and strips all HTML tags using `strip_tags()` before validation.
  - Eloquent model mutators in `DataRecord` sanitize attributes prior to database persistence.
  - Category inputs are restricted via strict Unicode regex (`/^[\pL\s\d\-&,'()\/]+$/u`).
- **5-Character Entity Escaping**: `escapeHtml()` in `dashboard.js` encodes `&`, `<`, `>`, `"`, and `'`. This closes attribute breakout vulnerabilities (`data-id="${...}"` and `data-category="${...}"`).
- **Blade Auto-Escaping**: All server-rendered Blade variables use double curly braces `{{ ... }}` which invokes `htmlspecialchars(..., ENT_QUOTES, 'UTF-8')`.

### 3. Rate Limiting & Denial of Service (DoS) Defense
- **API Throttling via RouteServiceProvider**:
  - Read endpoints (`GET /api/chart-data`): Throttled to **60 requests/minute** per IP.
  - Write endpoints (`POST`, `PUT`, `DELETE /api/records`): Throttled to **30 requests/minute** per IP.
  - Exceeding the threshold triggers HTTP 429 (`Too Many Requests`) with a clean JSON payload.
- **Strict Route Model Binding**: IDs are regex-constrained (`->whereNumber('dataRecord')`), rejecting path traversal and SQL payloads at the routing tier.

### 4. HTTP Security Headers
The custom `SecurityHeaders` middleware injects the following headers into every response:
- **`Content-Security-Policy (CSP)`**: Restricts executable scripts and styles to self and vetted CDNs (jsDelivr, Google Fonts). Blocks unauthorized external script injection.
- **`X-Frame-Options: SAMEORIGIN`**: Neutralizes clickjacking and unauthorized embedding in iframes.
- **`X-Content-Type-Options: nosniff`**: Prevents browsers from MIME-sniffing files away from their declared type.
- **`Referrer-Policy: strict-origin-when-cross-origin`**: Protects sensitive internal URLs from leaking.
- **`Permissions-Policy`**: Shuts down camera, microphone, geolocation, and payment APIs.
- **`Strict-Transport-Security (HSTS)`**: Enforces HTTPS transport with `max-age=31536000; includeSubDomains; preload`.

### 5. Session Security & CSRF Defense
- Session cookies configured with `http_only => true`, `same_site => 'lax'`, and `secure => true` (on HTTPS) to block session hijacking and cookie theft.
- `VerifyCsrfToken` middleware verifies the `X-CSRF-TOKEN` header on all non-GET requests.
- Sensitive inputs (`password`, `token`, `secret`) are excluded from session flashing via `app/Exceptions/Handler.php`.

### 6. Information Shielding & Error Handling
- In production (`APP_DEBUG=false`), internal stack traces, class names, and database connection strings are never exposed to clients.
- Nginx blocks direct access to hidden files (`.env`, `.git`) and framework code directories (`/app`, `/database`, `/storage/logs`).

---

## 🚀 GitHub Ready Deployment Guide

### Option 1: Publishing to GitHub

1. **Initialize Git in the project root**:
   ```powershell
   cd "c:\Users\HI\OneDrive\Desktop\SalesSync"
   git init
   git branch -M main
   ```

2. **Stage and commit files** (the hardened `.gitignore` ensures zero secrets or local databases are staged):
   ```powershell
   git add .
   git commit -m "feat: initial commit - SalesSync hardened dashboard with real-time charts"
   ```

3. **Link your GitHub repository and push**:
   ```powershell
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git push -u origin main
   ```

4. **Automated CI/CD Workflow**:
   Once pushed, GitHub Actions immediately triggers `.github/workflows/ci.yml`:
   - Validates `composer.json` syntax.
   - Runs `composer audit` to scan dependencies for known CVE vulnerabilities.
   - Sets up PHP 8.2 and runs database migrations.
   - Executes the full PHPUnit feature and unit test suite.

---

### Option 2: Production Deployment with Docker & Docker Compose

SalesSync includes a production-grade multi-stage `Dockerfile` and `docker-compose.yml` with isolated internal networking:

1. **Review and customize environment variables** in `docker-compose.yml`:
   ```yaml
   MYSQL_ROOT_PASSWORD: YourStrongRootPasswordHere!
   MYSQL_PASSWORD: StrongProductionPassword2026!
   ```

2. **Launch the stack**:
   ```bash
   docker-compose up -d --build
   ```

3. **Verify the services**:
   ```bash
   docker-compose ps
   ```
   The dashboard is live at `http://localhost:8000`. The MySQL database container runs on an internal Docker bridge network and is not exposed to the public host port.

---

### Option 3: Local Development with Laravel Artisan

#### Prerequisites:
- PHP >= 8.1 (with `pdo`, `pdo_sqlite` or `pdo_mysql`, `mbstring`, `openssl`, `bcmath`)
- Composer

1. **Install dependencies**:
   ```bash
   composer install
   ```

2. **Initialize environment**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Run migrations & sample data seeder**:
   - **Using SQLite (Zero setup)**:
     ```powershell
     New-Item -ItemType File -Path database/database.sqlite -Force
     php artisan migrate --seed
     ```
   - **Using MySQL**:
     Set `DB_CONNECTION=mysql`, `DB_HOST=127.0.0.1`, and your credentials in `.env`, then:
     ```bash
     php artisan migrate --seed
     ```

4. **Start the local server**:
   ```bash
   php artisan serve
   ```
   Open **`http://localhost:8000`** in your browser.

---

### Option 4: Instant Browser Testing (No Backend Server Required)

Double click `public/index.html` to open it in any modern web browser (or serve it with `npx serve public`). The dashboard will boot with sample records and operate with live real-time chart updates using `localStorage`.

---

## 📁 Complete Project Structure

```
SalesSync/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                            # GitHub Actions: test, lint & security audit
│   │   └── deploy.yml                        # GitHub Actions: container build & deploy
│   ├── ISSUE_TEMPLATE/
│   │   └── bug_report.md                     # GitHub issue template
│   └── PULL_REQUEST_TEMPLATE.md              # GitHub PR template & security checklist
├── app/
│   ├── Console/
│   │   └── Kernel.php                        # Console schedule runner
│   ├── Exceptions/
│   │   └── Handler.php                       # Secure error handler (strips credentials)
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── DashboardController.php       # Serves dashboard view with metrics
│   │   │   ├── DataController.php            # Transaction-safe CRUD API controller
│   │   │   └── Api/
│   │   │       └── ChartDataController.php   # Chart analytics API & category filter
│   │   ├── Middleware/
│   │   │   └── SecurityHeaders.php           # Injects CSP, HSTS, X-Frame-Options, etc.
│   │   ├── Requests/
│   │   │   └── StoreDataRequest.php          # Strict input validation & XSS sanitization
│   │   └── Kernel.php                        # HTTP middleware stack & security aliases
│   ├── Models/
│   │   └── DataRecord.php                    # Mass-assignment safe Eloquent model
│   ├── Providers/
│   │   ├── AppServiceProvider.php            # HTTPS enforcement & schema settings
│   │   └── RouteServiceProvider.php          # Configures 60/min and 30/min rate limiters
│   └── Services/
│       └── ChartDataService.php              # Aggregates bar, line, pie, and stats data
├── bootstrap/
│   ├── app.php                               # Application bootstrap & kernel bindings
│   └── cache/                                # Framework boot caches (.gitignore included)
├── config/
│   ├── app.php                               # Application & provider configuration
│   ├── cors.php                              # Strict CORS origin restrictions
│   ├── database.php                          # Native prepared statements & strict mode
│   └── session.php                           # HttpOnly, SameSite, and Secure cookies
├── database/
│   ├── factories/
│   │   └── DataRecordFactory.php             # Fake data generation for testing
│   ├── migrations/
│   │   └── 2024_01_01_000000_create_data_records_table.php # Database schema with indexes
│   ├── seeders/
│   │   └── DatabaseSeeder.php                # Seeds 20 realistic sales records
│   └── schema.sql                            # Hardened MySQL DDL with least-privilege user
├── docker/
│   ├── nginx/
│   │   └── default.conf                      # Hardened Nginx server block (blocks .env/.git)
│   ├── entrypoint.sh                         # Container startup & migration script
│   └── supervisord.conf                      # Process manager for Nginx + PHP-FPM
├── public/
│   ├── css/
│   │   └── dashboard.css                     # Responsive CSS (variables, grid, toasts)
│   ├── images/
│   │   └── logo.png                          # SalesSync brand logo
│   ├── js/
│   │   ├── chart-handler.js                  # Chart.js lifecycle, rendering & transitions
│   │   ├── form-handler.js                   # Form validation, edit states & AJAX calls
│   │   └── dashboard.js                      # Orchestrator, filters, table & DOM escaping
│   ├── index.html                            # Standalone static preview with live sync
│   └── index.php                             # Laravel web front controller
├── resources/
│   └── views/
│       ├── dashboard/
│       │   ├── chart.blade.php               # Chart canvas & tab switcher partial
│       │   ├── form.blade.php                # Add / Edit form partial
│       │   ├── index.blade.php               # Main dashboard grid
│       │   └── records.blade.php             # Filterable records table partial
│       ├── errors/
│       │   └── 404.blade.php                 # Friendly error page
│       └── layouts/
│           └── app.blade.php                 # Master layout (navbar, modal, toast container)
├── routes/
│   ├── api.php                               # Rate-limited REST API routes
│   ├── console.php                           # Artisan console commands
│   └── web.php                               # Web route (GET /)
├── storage/                                  # Framework storage (sessions, cache, logs)
├── tests/
│   ├── CreatesApplication.php                # Test application bootstrapper
│   ├── TestCase.php                          # Base test case class
│   ├── Feature/
│   │   └── DataRecordTest.php                # Feature tests: CRUD, XSS, headers, API
│   └── Unit/
│       └── ChartDataServiceTest.php          # Unit tests: aggregations, line & pie math
├── .env.example                              # Production-ready environment template
├── .gitattributes                            # Enforces consistent LF line endings
├── .gitignore                                # Comprehensive secret & cache exclusion
├── artisan                                   # Laravel CLI runner
├── composer.json                             # PHP dependencies & autoloading
├── docker-compose.yml                        # Multi-container orchestration
├── Dockerfile                                # Security-hardened container specification
├── LICENSE                                   # MIT License
├── package.json                              # Frontend package configurations
├── phpunit.xml                               # Automated testing configuration
├── README.md                                 # Comprehensive documentation
└── SECURITY.md                               # Security policy, threat model & disclosure
```

---

## 🧪 Testing Additions, Edits, Deletions & Security

### 1. Automated Test Suite
Run the full test suite (including security tests for XSS sanitization, rate limiting, and security headers):
```bash
php artisan test
```

### 2. Manual Functionality Verification
- **Add Record**: Fill in Category, Amount, Date, and Description, then click **Add Record**. Notice the immediate Chart.js animation, summary metric updates, and table insertion without a page reload.
- **Edit Record**: Click the blue **Edit** button on any table row. The form enters **Edit Mode**, inputs populate, and the row highlights. Click **Update Record** to recalculate the charts and metrics in real time.
- **Delete Record**: Click the red **Delete** button. A modal requests confirmation. On deletion, the row slides out, and the chart updates dynamically.
- **Form Validation**: Try submitting an empty form or entering negative values, future dates, or characters outside the allowed category regex. Error messages display inline.

---

## 🩺 Troubleshooting Common Issues

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| **CSRF Token Mismatch (419)** | Missing or expired CSRF token in session | Ensure `<meta name="csrf-token">` is present. Run `php artisan optimize:clear` to refresh session storage. |
| **Rate Limit Exceeded (429)** | More than 30 write requests or 60 read requests per minute | Wait 60 seconds for the rate limit counter to reset. In development, rate limits can be tuned in `app/Providers/RouteServiceProvider.php`. |
| **SQLSTATE Database Connection Error** | MySQL not started or SQLite file missing | For SQLite, create the file: `touch database/database.sqlite`. For MySQL, verify credentials in `.env` and verify port 3306. |
| **Validation Error (422)** | Category contains invalid characters, future date, or >2 decimal places | Ensure category contains alphanumeric text, punctuation (`-`, `&`, `,`, `'`, `/`), and that value is positive with at most two decimal places. |
| **Chart not rendering** | CDN blocked or canvas container collapsed | Verify internet connection for CDN links (`cdn.jsdelivr.net`). Check browser console for network blocks. |

---

## 📜 License

This project is open-sourced under the [MIT License](LICENSE).
