# Antorcha — Security

## 1. Purpose

This document defines security boundaries, authentication and authorization rules, data protections, secret-handling practices, and verification controls for Antorcha. Controls apply to the public interface, authenticated dashboard, API route handlers, server-side services, and Supabase PostgreSQL database.

## 2. Security Objectives

- Protect user identity and authentication state.
- Enforce `ADMIN` and `USER` permissions on the server.
- Protect database access and data integrity.
- Prevent unauthorized inventory, order, payment, and user mutations.
- Protect authentication secrets and database credentials.
- Minimize sensitive data returned to clients.
- Preserve accountability for inventory movements and administrative changes.
- Handle failures without disclosing internal implementation details.

## 3. Main Security Properties

| Property        | Objective                                          | Relevant Controls                                       | Verification                 |
|-----------------|----------------------------------------------------|---------------------------------------------------------|------------------------------|
| Confidentiality | Return only data needed by authorized users        | Server authorization, explicit response schemas         | API response/access tests    |
| Integrity       | Keep stock, orders, payments, and roles consistent | Zod validation, database transactions and constraints   | Unit/integration tests       |
| Authentication  | Verify identity for each session                   | Auth.js, password hashes, secure session config         | Authentication tests         |
| Authorization   | Enforce permissions per operation                  | Shared server-side guards and role checks               | Positive/negative role tests |
| Availability    | Handle failures and bound expensive queries        | Pagination, query limits, rate limiting where supported | Failure/load tests           |
| Accountability  | Identify the actor responsible for stock changes   | Session-derived actor, retained movement history        | Database/audit tests         |

## 4. Security Architecture

### Trust Boundaries

1. **Browser:** all form values, query parameters, route parameters, and client state are untrusted.
2. **Next.js server:** route handlers and server-only services authenticate, validate, authorize, and shape responses.
3. **Database:** Supabase PostgreSQL stores application records; Prisma accesses it from trusted server-side code.
4. **Deployment:** Vercel environment variables store environment-specific credentials and secrets.
5. **External services:** hosting, database, and authentication services are accessed through documented interfaces and configured credentials.

### Authentication / Identity Components

- Auth.js manages authentication and sessions.
- Credentials-based sign-in verifies submitted passwords against stored password hashes.
- `bcryptjs` hashes passwords and verifies submitted credentials.
- User roles are `ADMIN` or `USER`.
- The server derives actor identity from the verified session.

### Authorization Components

- Shared server-side helpers verify session and role.
- Each protected route handler enforces permission before querying or mutating data.
- Navigation visibility is a usability aid, not a security boundary.
- Proxy/middleware provides early navigation decisions and redirects; API handlers and data-access services still enforce authorization.

### Data and Service Boundaries

- Prisma is initialized in server-only code and is never imported into client components.
- Database connection strings and Auth.js secrets are server-only environment variables.
- API responses use explicit fields and never serialize password hashes or secrets.
- Related mutations use database transactions and constraints.

## 5. Authentication

### Provider

Auth.js manages authentication with the configured credentials provider. Password verification uses `bcryptjs`; plaintext passwords are never stored.

### Flow

1. The visitor opens the public landing page and chooses Sign In.
2. The user submits an email and password.
3. The server validates input and retrieves the account.
4. The server compares the submitted password with the stored hash.
5. Auth.js establishes the configured session on success.
6. Protected pages and APIs read the verified session on the server.
7. Failed sign-in displays a generic error.

### Token / Session Lifecycle

- Session behavior follows the configured Auth.js strategy and lifetime.
- Session secrets are stored in environment configuration.
- Client-provided role values are never authoritative.
- Role-sensitive operations check a trusted current role so role changes revoke privileges promptly.
- Production cookies use secure settings and production traffic uses HTTPS.

### Logout and Recovery

- Sign-out invalidates the application session through Auth.js.
- Invalid or expired sessions cannot access protected operations.
- Account recovery is exposed only through a configured and verified recovery flow.

## 6. Authorization

### Roles

| Role    | Permissions                                                                                                                     | Scope                                                           |
|---------|---------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| `ADMIN` | All application functions, including user administration and master creation                                                    | Full application                                                |
| `USER`  | View transactions and masters, create inventory movements, and use permitted operational catalog/order/payment/report functions | Operational features; no user administration or master creation |

The academic requirements reserve user administration and master creation for ADMIN. Any additional mutation follows its explicit endpoint policy and does not inherit access merely because a navigation link is visible.

### Ownership Rules

- Movement actor IDs and master creator IDs are assigned by the server from the authenticated session.
- Client payloads cannot choose another user as actor or creator.
- Order and payment relationships are checked against persisted records.
- Only an authorized administrator can change a user's role.

### Enforcement Points

- Proxy/middleware: early navigation redirects and page access decisions.
- API handlers: session and role verification on every protected request.
- Service layer: domain invariants before persistence.
- Database transactions/constraints: integrity under concurrency and invalid operations.
- UI: hides unavailable actions and displays feedback but does not replace server checks.

## 7. Supabase / Database Security

### Service

Supabase provides managed PostgreSQL. Prisma connects from server-side application code using configured connection strings and the required PostgreSQL adapter.

### Validation

- Zod validates bodies, query/path parameters, quantities, dates, enums, and state transitions.
- Prisma uses structured query arguments rather than concatenated SQL.
- Database constraints protect required fields, uniqueness, relationships, and invariants.
- Inventory changes use transactions and stock consistency checks.

### Server-Only Operations

- Prisma and database URLs are server-only.
- The browser never receives a privileged database connection string.
- Supabase service-role credentials, if configured for a specific server integration, never enter client code and do not replace application authorization.
- Direct database access from the browser is not part of the application data-access model.

## 8. Network Security

- Production traffic uses HTTPS/TLS.
- API inputs and query sizes are validated and bounded.
- Cross-origin access is restricted to application origins when CORS applies.
- Mutating operations use Auth.js-supported request protections and secure cookie configuration.
- Rate limiting is applied to sensitive endpoints where the deployment architecture supports it.
- Responses exclude stack traces, SQL details, database URLs, password hashes, and secrets.
- Pagination and report ranges are bounded to prevent unbounded queries.

## 9. Local Data Security

| Data                          | Stored Locally?                                    | Protection                                        | Retention                                   |
|-------------------------------|----------------------------------------------------|---------------------------------------------------|---------------------------------------------|
| Auth session                  | Session cookie and/or configured Auth.js mechanism | Secure cookie settings and server validation      | Until expiration/sign-out per configuration |
| Password                      | No plaintext password                              | Only a password hash is persisted                 | While account exists                        |
| User profile fields           | No authoritative persistent browser copy           | Authenticated API; minimal UI state               | Server record lifecycle                     |
| Inventory/orders/transactions | No authoritative browser copy                      | Server authorization and database controls        | According to application retention policy   |
| Environment secrets           | No                                                 | `.env` is Git-ignored; deployment secret settings | Rotated when required                       |

## 10. Secrets Management

### Secrets

- `DATABASE_URL` and any direct/migration database URL.
- `AUTH_SECRET`.
- Any additional server-only integration key.

### Storage

- Local secrets reside in `.env`, excluded from source control.
- `.env.example` contains variable names and placeholders only.
- Production secrets reside in Vercel environment configuration.
- Secrets are not embedded in source, client variables, screenshots, logs, or documentation.

### Rotation

Secrets are rotated after suspected exposure, team-access changes, or provider-recommended events. Rotation includes updating the environment, redeploying, and verifying service access.

### Prohibited Practices

- [x] No secrets in source control.
- [x] No secrets in logs.
- [x] No real credentials in documentation.
- [x] No plaintext passwords.
- [x] No privileged database keys in client components.
- [x] No authorization decisions based only on client state.

## 11. Security Rules

- Validate every untrusted input on the server.
- Use least privilege for database and deployment credentials.
- Use explicit response schemas and omit private fields.
- Verify permissions on every protected API request.
- Derive actor and creator IDs from the authenticated session.
- Reject invalid role values and state transitions.
- Prevent outbound movements from creating negative stock.
- Keep movement history append-only in ordinary workflows.
- Protect the last administrator from accidental removal or demotion.
- Return generic authentication errors and safe server errors.
- Never log passwords, cookies, tokens, or environment values.
- Keep dependencies and lockfiles under version control and review security alerts.

## 12. Other Services

| Service             | Data/Access                             | Security Control                                                  |
|---------------------|-----------------------------------------|-------------------------------------------------------------------|
| Supabase PostgreSQL | Application records and database access | Server-only credentials, database constraints, configured backups |
| Auth.js             | Authentication and session management   | Secret configuration, secure cookies, server-side verification    |
| Vercel              | Hosting and environment settings        | Protected project access, environment-scoped secrets, HTTPS       |
| Package registry    | Public packages and dependency metadata | Lockfile, dependency review, vulnerability audit                  |
| Charting library    | Aggregated report data in UI            | Only non-secret display data is passed to client charts           |

## 13. Privacy

### Data Collected

- User ID, email, role, and account creation metadata.
- Inventory masters, ingredients, products, categories, and movement history.
- Order line items, payment records, and operational timestamps.
- Actor identifiers required for accountability.

### Purpose

Data supports authentication, access control, restaurant operations, reporting, inventory traceability, and administration.

### Retention / Deletion

Operational records retain their relationships and history. Records referenced by orders, payments, or movements are not destructively removed when doing so compromises auditability. User deactivation/deletion follows administrative and data-integrity rules.

### Third Parties

The application relies on configured hosting, authentication, and database services. It does not transmit card data to a payment provider because live card processing is out of scope.

## 14. Notifications

In-app feedback reports successful operations, validation failures, and errors. Notifications never contain passwords, session tokens, connection strings, or secrets. Email/SMS notifications are not part of the defined scope.

## 15. Threat Model

### Assets

- User accounts, roles, and authentication sessions.
- Inventory balances and movement history.
- Menu catalog, orders, and payment records.
- Database credentials and authentication secrets.
- Report data and operational metrics.

### Actors

- Anonymous visitor.
- Authenticated USER.
- Authenticated ADMIN.
- Malicious or compromised account.
- External attacker sending crafted requests.

### Trust Boundaries

- Browser to Next.js server.
- Next.js server to Supabase PostgreSQL.
- Runtime to deployment configuration.
- Application to hosting/authentication infrastructure.

### Threats and Mitigations

| Threat                       | Asset                     | Mitigation                                 | Verification                 | Residual Risk                                 |
|------------------------------|---------------------------|--------------------------------------------|------------------------------|-----------------------------------------------|
| Unauthorized admin access    | Users and master creation | Server-side role checks                    | Negative authorization tests | Misconfiguration remains possible             |
| UI bypass through direct API | Protected data/mutations  | Route-level authorization                  | Direct-request tests         | New endpoints require review                  |
| Injection or malformed input | Database integrity        | Prisma structured queries and Zod          | Validation/integration tests | Logic defects remain possible                 |
| Negative/inconsistent stock  | Inventory                 | Atomic transactions and balance checks     | Boundary/concurrency tests   | Operational mistakes remain possible          |
| Password disclosure          | Accounts                  | Hashing and explicit response fields       | Response tests               | Credential reuse is outside app control       |
| Secret leakage               | Database/session security | Environment-only secrets and scans         | Repository scans             | Accidental external exposure remains possible |
| Role escalation              | Administrative privileges | Allowlisted roles and ADMIN-only mutations | Role escalation tests        | Account compromise remains possible           |
| Internal error disclosure    | Application internals     | Generic client errors and sanitized logs   | Error-path tests             | Misconfigured logs may expose metadata        |
| Dependency vulnerability     | Runtime                   | Lockfile, audits, updates                  | CI dependency scan           | Zero-day risk remains                         |

## 16. Error Handling

- Validation failures return structured `400` responses with safe field details.
- Missing authentication returns `401`.
- Authenticated users without permission receive `403`, or a safe page redirect.
- Missing resources return `404`.
- State conflicts return `409`.
- Unexpected failures return a generic `500`, with a request identifier where available.
- Stack traces and database details remain server-side.
- Structured logs exclude secrets and authentication payloads.

## 17. Dependency Security

- **Dependency updates:** reviewed updates are installed through `pnpm`.
- **Lockfiles:** `pnpm-lock.yaml` is committed and used in CI/deployment.
- **Vulnerability scanning:** dependency audits run regularly and in CI where supported.
- **Secret scanning:** repository/CI checks detect accidental credential commits.
- **Static analysis:** TypeScript and ESLint run as quality gates.
- **Third-party SDK review:** dependencies are limited to product needs and reviewed before adoption.

## 18. Security Testing

| Test / Check       | Scope                                 | When          | Required Result                             |
|--------------------|---------------------------------------|---------------|---------------------------------------------|
| Authentication     | Credentials, session, sign-out        | Every release | Invalid sessions do not grant access        |
| Authorization      | ADMIN/USER endpoint access            | Every release | Forbidden operations are rejected           |
| Database integrity | Stock, relations, atomic updates      | Every release | No partial or invalid state                 |
| API validation     | Body, path, and query input           | Every release | Invalid data is rejected                    |
| Secret scan        | Repository and build configuration    | Every release | No committed secrets                        |
| Dependency scan    | Installed packages                    | Every release | Critical issues are reviewed before release |
| Error handling     | Validation/database/unexpected errors | Every release | Safe, structured responses                  |
| Role-change safety | Self-demotion/last administrator      | Every release | Unsafe changes are rejected                 |

## 19. Security Priorities

### Required Before Release

- Authentication and server-side authorization.
- Password hashing and secure session configuration.
- Environment-only secrets.
- Request validation.
- Atomic inventory updates.
- Explicit safe API response schemas.
- Protection for user and master operations.

### Feature-Specific Requirements

- Every movement records its authenticated actor.
- Payment records do not store card data.
- Role changes validate target role and protect the last administrator.
- Reports validate date filters and enforce permissions.

### Hardening

- Rate limiting for sensitive endpoints.
- Automated dependency and secret scans.
- Sanitized structured logging.
- Security review of environment and deployment permissions.

### Future Improvements

Additional hardening is tracked separately and does not weaken any required control.

## 20. Related Documentation

- `SPEC.md`
- `REQUIREMENTS.md`
- `API.md`
- `DESIGNSYSTEM.md`
