# Employee Attendance & Leave Management System

Enterprise HRMS attendance platform. React (Vite + TypeScript + Tailwind) → Spring Boot REST API → MySQL.

Architecture lives in [`docs/`](docs/README.md). Start there before changing anything structural.

## Current state

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Architecture, DB design, scaffolding | done |
| 2 | Authentication, JWT + rotating refresh, RBAC | done |
| 3 | Employee, department, designation, office, shift masters | done |
| 4 | Punch in/out, geofencing, attendance calculation | done |
| 5 | Attendance dashboard, history, calendar | done (employee views) |
| 6 | Leave management, balances, approval workflow | done |
| 7 | Regularization, work from home | done |
| 8 | Manager and HR dashboards | done |
| 9 | Reports, notifications, audit viewer | done |
| 10 | Testing, security hardening, Docker, deployment | done |
| — | Exam module (weekly study exams) | planned — see [`docs/07-exam-module-plan.md`](docs/07-exam-module-plan.md) |

## Running it locally

### 1. Create the database

Requires MySQL 8. Run this yourself — it sets a password:

```sql
CREATE DATABASE IF NOT EXISTS attendance_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'attendance_app'@'localhost' IDENTIFIED BY 'CHOOSE_A_PASSWORD';
GRANT ALL PRIVILEGES ON attendance_db.* TO 'attendance_app'@'localhost';
FLUSH PRIVILEGES;
```

On Windows the MySQL client is usually not on `PATH`; it lives at
`C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe`.

### 2. Configure the backend

Copy `.env.example` to `.env` and fill in `DB_PASSWORD` and `JWT_SECRET`. Generate a secret:

```bash
openssl rand -base64 64
```

The JWT secret must base64-decode to at least 64 bytes — the app refuses to start otherwise, rather
than silently signing with a weak key.

### 3. Start the backend

```bash
cd backend && DB_USERNAME=attendance_app DB_PASSWORD=your_password JWT_SECRET=your_secret ./mvnw spring-boot:run
```

Flyway applies `V1`–`V15` on first start: schema, the role and permission catalogue, reference
data, and a bootstrap administrator.

### 4. Start the frontend

```bash
cd frontend && npm run dev
```

### 5. Sign in

| Field | Value |
|---|---|
| Employee ID | `EMP0001` |
| Password on a fresh database | `ChangeMe@123` |

The account ships flagged `must_change_password`, so the app forces a rotation before anything else.
Changing a password revokes every session, so you are returned to sign-in afterwards.

The seeded hash is published in `V6`, which is exactly why `StartupSecurityValidator` refuses to
serve outside a dev profile while it is still in place. **Delete or disable this user before any
real deployment.**

### Ports

The API defaults to `8080` and the dev frontend to `5175`. Windows often reserves `8080`; set
`SERVER_PORT` in `.env` if so, point `VITE_API_BASE_URL` at the same port, and make sure
`CORS_ALLOWED_ORIGINS` lists the frontend's origin.

## Tests

```bash
cd backend && ./mvnw test
```

Two hundred and ten tests cover context wiring, the auth flow (login by employee code and by email, account
enumeration resistance, lockout after repeated failures, refresh-token rotation with reuse
detection, endpoint protection, request validation), and employee management (login provisioning,
reporting-cycle prevention, SELF and TEAM data scope, shift assignment closing the previous
open-ended row, shift threshold validation, and deactivation guards), plus a timezone guard that
pins the JVM to UTC so shift times cannot drift by the server's offset.

Phase 4 adds the attendance engine: the working-hour arithmetic (grace as forgiveness rather than a
shifted start, night shifts belonging to the date they began, thresholds from the shift over the
policy), the Haversine geofence against known real-world distances, and the punch lifecycle
end to end — duplicate-punch rejection, break guards, and the work-mode branches.

Phase 6 adds leave: the balance ledger with its reservation column, holiday-aware day counting
driven by each leave type's own configuration, overlap detection through the exploded day rows,
and the approval chain resolved from the reporting hierarchy rather than from roles.

Phase 10 hardens and packages it. The application now validates its own
configuration on startup and refuses to serve outside a dev profile on a placeholder
JWT secret, an insecure refresh cookie, a wildcard CORS origin, an enabled Swagger UI,
or a bootstrap administrator whose password is still the one published in the
migration. Credential endpoints are rate limited per source, because account lockout
only ever covered the opposite attack. Routes are code-split, taking first load from
686 kB to 286 kB. See `docs/06-deployment.md`, which also lists plainly what is not
built.

Phase 9 adds reports, notifications and the audit viewer. Twelve reports resolve to one shape —
typed columns plus rows keyed by them — which is what lets a single exporter produce CSV, Excel and
PDF for all of them and a single table render any of them. A duration is "7h 45m" in a PDF someone
reads and the number 494 in a spreadsheet where someone will sum it. Notifications reach people
through published events, so the notification module never imports leave; they are bound to
after-commit, because a message about an approval that then rolled back is worse than no message.

Phase 8 adds the team and organisation views: one set of endpoints that a manager and an HR user
both call, where the permission decides how wide the answer is. The tests hold one line above all —
a person away for a legitimate reason is never counted as an absence. Approved leave, weekly offs
and holidays are each counted as themselves, the rate is measured against the people who were
actually meant to work, and nobody is counted at all on a day outside their employment. The bulk
import screen lands here too, along with the fix for the manager column it turned out the importer
had been accepting and silently discarding.

Phase 7 adds corrections and work from home: the frozen before-image that survives the rewrite it
authorises, the append-only punch evidence that an approved correction adds to rather than
replaces, and the one behaviour the phase exists for — an approved work-from-home day lifts the
geofence for exactly the days listed and no others. The approval inbox is tested against the same
three conditions the decision path allows, because a request routed to nobody once sat PENDING in
no inbox at all and nothing in the suite noticed.

## Layout

```
backend/    Spring Boot API — see docs/02-project-structure.md
frontend/   React SPA — see docs/02-project-structure.md
docs/       Architecture, database design, workflows, API design
stitch_enterprise_attendance_leave_system/
            Source design mockups and the Kinetic Enterprise design system.
            frontend/tailwind.config.js is transcribed from kinetic_enterprise/DESIGN.md —
            change a token there and change it here.
```

## Non-negotiables

These are enforced in review because breaking them is how this class of system goes wrong:

1. **Identity comes from the JWT, never the request body.** A body-supplied `employeeId` on a
   self-service endpoint is ignored.
2. **Attendance is never silently overwritten.** `attendance` is a derived summary;
   `attendance_punch_events` is append-only.
3. **No hardcoded policy.** Grace periods, hour thresholds, geofence radii and approval levels all
   resolve from configuration at runtime.
4. **All instants stored UTC.** Business dates resolve in the *office's* timezone.
5. **Every list endpoint is paginated.** Default 20, hard maximum 100.
6. **Schema changes only through Flyway.** `ddl-auto` is `validate` everywhere.
