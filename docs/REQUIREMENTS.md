# Antorcha — Requirements

| Field                 | Value        |
|-----------------------|--------------|
| Project               | Antorcha     |
| Document              | Requirements |
| Version               | 1.0          |
| Status                | Approved     |
| Last Updated          | 2026-10-14   |
| Specification Version | 1.0          |

## 1. Purpose

This document defines the testable functional and non-functional requirements for Antorcha. It is authoritative for requirement identifiers, acceptance criteria, priorities, constraints, and traceability. `SPEC.md` describes the product at a higher level.

## 2. Product Scope

### In Scope

- Authentication and role-based access.
- Landing page and responsive dashboard.
- Inventory master records, products, categories, and ingredients.
- Inventory balances, movements, transactions, and daily balance chart.
- Orders, order items, and internal payment records.
- Administrator user management and operational reports.
- Supabase PostgreSQL persistence through Prisma.

### Out of Scope

- Live payment processing or card data.
- Public online ordering, delivery, reservations, and customer accounts.
- Payroll, supplier procurement, multi-branch management, and native mobile apps.

## 3. Requirement Conventions

Functional IDs use `FR-001`; non-functional IDs use `NFR-001`. Priorities are **Must**, **Should**, **Could**, and **Won't**. Must requirements define the minimum accepted release.

## 4. Functional Requirements

### Feature / Epic: Authentication and Access

#### FR-001 — Authenticate Users

**Description:**

WHEN a user submits valid credentials, THE SYSTEM SHALL establish an authenticated session and grant dashboard access.

**Acceptance Criteria:**

- AC-FR-001-01: Valid credentials establish a session.
- AC-FR-001-02: Invalid credentials return a generic error without revealing account existence.
- AC-FR-001-03: Passwords are never stored or returned as plaintext.
- AC-FR-001-04: Sign-out invalidates the authenticated session.

**Priority:**

Must

**Traceability:**

- SPEC Feature: `F-001`
- User Flow: `UF-001`, `UF-002`

#### FR-002 — Enforce Role-Based Access

**Description:**

WHEN a request accesses a protected page or operation, THE SYSTEM SHALL verify the user's authenticated identity and current role and reject unauthorized access.

**Acceptance Criteria:**

- AC-FR-002-01: `ADMIN` can access administrator functions.
- AC-FR-002-02: `USER` cannot administer users or create masters.
- AC-FR-002-03: Both roles can view transactions and masters and create inventory movements.
- AC-FR-002-04: Direct API requests receive the same authorization checks as UI navigation.
- AC-FR-002-05: Client-provided role values never determine authorization.

**Priority:** Must

**Traceability:** SPEC `F-001`, `F-006`; flows `UF-003`, `UF-006`, `UF-014`, `UF-015`.

#### FR-003 — Public Landing and Sign-In

**Description:**

WHEN a visitor opens the root route, THE SYSTEM SHALL display the Antorcha landing page with a clear sign-in action.

**Acceptance Criteria:**

- AC-FR-003-01: The landing page is public.
- AC-FR-003-02: The sign-in action opens the login page.
- AC-FR-003-03: The page identifies Antorcha as a restaurant bar and uses the approved design system.

**Priority:** Must

**Traceability:** SPEC `F-001`; flow `UF-001`.

### Feature / Epic: Dashboard and Navigation

#### FR-004 — Role-Aware Responsive Navigation

**Description:**

WHEN an authenticated user opens the dashboard, THE SYSTEM SHALL display the user's identity and navigation permitted by their role.

**Acceptance Criteria:**

- AC-FR-004-01: The sidebar shows the user's name and image or fallback avatar.
- AC-FR-004-02: Transactions and Masters are visible to both roles.
- AC-FR-004-03: Users navigation is visible only to `ADMIN`.
- AC-FR-004-04: Navigation remains usable on narrow screens.
- AC-FR-004-05: Hiding links does not replace server authorization.

**Priority:** Must

**Traceability:** SPEC `F-002`; flows `UF-003`, `UF-004`.

### Feature / Epic: Masters and Catalog

#### FR-005 — List Master Records

**Description:**

WHEN an authorized user opens Masters, THE SYSTEM SHALL display each inventory master’s ID, name, current balance, and creator.

**Acceptance Criteria:**

- AC-FR-005-01: Both roles can view masters.
- AC-FR-005-02: Each row displays the required fields.
- AC-FR-005-03: Loading and empty states are clear.
- AC-FR-005-04: Displayed balance matches persisted inventory state.

**Priority:** Must

**Traceability:** SPEC `F-003`; flow `UF-005`.

#### FR-006 — Create Masters as ADMIN

**Description:**

WHEN an administrator submits a valid master form, THE SYSTEM SHALL create the record, associate the authenticated creator, and refresh the table.

**Acceptance Criteria:**

- AC-FR-006-01: The form accepts a name and non-negative initial balance.
- AC-FR-006-02: Creator identity is derived from the session.
- AC-FR-006-03: A USER request is rejected even when sent directly to the API.
- AC-FR-006-04: The form displays pending and success/error states.
- AC-FR-006-05: Success closes the dialog and refreshes the table.
- AC-FR-006-06: Initial balance and opening stock history remain consistent.

**Priority:** Must

**Traceability:** SPEC `F-003`; flow `UF-006`.

#### FR-007 — Manage Products, Categories, and Ingredients

**Description:**

WHEN authorized staff access the catalog, THE SYSTEM SHALL provide validated records for menu products, categories, and stock-bearing ingredients.

**Acceptance Criteria:**

- AC-FR-007-01: Products can be listed and filtered by category.
- AC-FR-007-02: Categories can be listed and maintained by authorized staff.
- AC-FR-007-03: Ingredients have a name, unit, and inventory relationship.
- AC-FR-007-04: Prices and recipe quantities are validated on the server.
- AC-FR-007-05: Records referenced by history are deactivated instead of destructively removed.
- AC-FR-007-06: Invalid relationships are rejected.

**Priority:** Should

**Traceability:** SPEC `F-003`; flow `UF-007`.

### Feature / Epic: Inventory and Transactions

#### FR-008 — List Inventory Movements

**Description:**

WHEN a user selects a master on Transactions, THE SYSTEM SHALL display that master’s movement history.

**Acceptance Criteria:**

- AC-FR-008-01: The table shows movement ID, date, quantity, type, and responsible user.
- AC-FR-008-02: Both roles can access the page.
- AC-FR-008-03: Selecting another master refreshes table and chart.
- AC-FR-008-04: Results default to newest first.
- AC-FR-008-05: Empty history has a clear empty state.

**Priority:** Must

**Traceability:** SPEC `F-004`; flow `UF-008`.

#### FR-009 — Create an Inventory Movement

**Description:**

WHEN a user submits a valid inbound or outbound movement, THE SYSTEM SHALL persist it, update the balance atomically, and associate the authenticated actor.

**Acceptance Criteria:**

- AC-FR-009-01: The form identifies the selected master.
- AC-FR-009-02: Type is inbound or outbound and quantity is positive.
- AC-FR-009-03: Actor is derived from the session.
- AC-FR-009-04: Outbound movement cannot make stock negative.
- AC-FR-009-05: Movement and balance update succeed or fail together.
- AC-FR-009-06: Pending and success/error feedback is displayed.
- AC-FR-009-07: Success closes the dialog and refreshes table and chart.
- AC-FR-009-08: Both roles can create movements.

**Priority:** Must

**Traceability:** SPEC `F-004`; flow `UF-009`.

#### FR-010 — Display Daily Balance Evolution

**Description:**

WHEN a user selects a master, THE SYSTEM SHALL display its daily balance evolution based on recorded inventory history.

**Acceptance Criteria:**

- AC-FR-010-01: The chart matches the selected master.
- AC-FR-010-02: Date aggregation uses a consistent timezone.
- AC-FR-010-03: Successful movements refresh chart values.
- AC-FR-010-04: Empty data displays a useful empty state.
- AC-FR-010-05: Labels and a textual summary make chart meaning accessible.

**Priority:** Must

**Traceability:** SPEC `F-004`; flow `UF-010`.

#### FR-011 — Preserve Movement History

**Description:**

THE SYSTEM SHALL preserve movements as traceable records and prevent ordinary operations from silently rewriting history.

**Acceptance Criteria:**

- AC-FR-011-01: Every movement records master, type, quantity, date, and actor.
- AC-FR-011-02: Normal workflows do not edit or delete historical movements.
- AC-FR-011-03: Corrections use compensating movements.
- AC-FR-011-04: Failed movements leave no partial balance update.

**Priority:** Must

**Traceability:** SPEC `F-004`; flows `UF-009`, `UF-010`.

### Feature / Epic: Orders and Payments

#### FR-012 — Manage Orders

**Description:**

WHEN authorized staff access orders, THE SYSTEM SHALL list orders and expose line items, status, totals, and timestamps.

**Acceptance Criteria:**

- AC-FR-012-01: Orders contain valid line items.
- AC-FR-012-02: Totals are calculated on the server from stored prices and validated quantities.
- AC-FR-012-03: Status changes follow allowed transitions.
- AC-FR-012-04: Historical orders remain interpretable when products are deactivated.
- AC-FR-012-05: Invalid transitions are rejected.

**Priority:** Should

**Traceability:** SPEC `F-005`; flows `UF-011`, `UF-012`.

#### FR-013 — Record Internal Payment Events

**Description:**

WHEN authorized staff record a payment event, THE SYSTEM SHALL associate it with an existing order and persist amount, method, status, and timestamp.

**Acceptance Criteria:**

- AC-FR-013-01: The order exists before payment is recorded.
- AC-FR-013-02: Amount is positive and follows outstanding-balance rules.
- AC-FR-013-03: Confirmed events are not silently overwritten.
- AC-FR-013-04: No card number, CVV, or banking credential is stored.
- AC-FR-013-05: UI does not imply live payment processing.

**Priority:** Should

**Traceability:** SPEC `F-005`; flow `UF-013`.

### Feature / Epic: User Administration

#### FR-014 — List Users

**Description:**

WHEN an administrator opens Users, THE SYSTEM SHALL display user ID, creation date, email, and role.

**Acceptance Criteria:**

- AC-FR-014-01: Only ADMIN can access the page and endpoint.
- AC-FR-014-02: Password hashes and secrets are excluded.
- AC-FR-014-03: Loading, empty, and error states are supported.
- AC-FR-014-04: Results are paginated when needed.

**Priority:** Must

**Traceability:** SPEC `F-006`; flow `UF-014`.

#### FR-015 — Change a User Role

**Description:**

WHEN an administrator saves a valid role change, THE SYSTEM SHALL update the user and refresh the table.

**Acceptance Criteria:**

- AC-FR-015-01: Dialog displays selected user's email and current role.
- AC-FR-015-02: Only `ADMIN` and `USER` are accepted.
- AC-FR-015-03: Only ADMIN can submit the change.
- AC-FR-015-04: Unsafe self-demotion or demotion of the last administrator is rejected.
- AC-FR-015-05: Pending and success/error states are shown.
- AC-FR-015-06: Table refreshes after success.
- AC-FR-015-07: A stale session cannot retain revoked privileges.

**Priority:** Must

**Traceability:** SPEC `F-006`; flow `UF-015`.

### Feature / Epic: Reports

#### FR-016 — Display Operational Reports

**Description:**

WHEN a user requests a report, THE SYSTEM SHALL return authorized summaries calculated from persisted operational records.

**Acceptance Criteria:**

- AC-FR-016-01: Sales reports support validated date ranges.
- AC-FR-016-02: Inventory reports show balances and configured low-stock indicators.
- AC-FR-016-03: Top-product reports use a consistent metric and date range.
- AC-FR-016-04: Empty ranges display zero values or an empty state.
- AC-FR-016-05: Calculations use server-side data.

**Priority:** Should

**Traceability:** SPEC `F-007`; flows `UF-016`, `UF-017`.

## 5. Non-Functional Requirements

### NFR-001 — Data Integrity

**Category:** Reliability / Data Integrity

**Description:** Inventory balances, movement history, order totals, and payment records remain consistent across successful and failed operations.

**Acceptance Criteria:**

- AC-NFR-001-01: Movement creation and balance changes are atomic.
- AC-NFR-001-02: Failed operations leave no partial writes.
- AC-NFR-001-03: Monetary calculations use decimal-safe arithmetic.

**Priority:** Must

**Traceability:** SPEC `F-004`, `F-005`, `F-007`.

### NFR-002 — Authentication Security

**Category:** Security

**Description:** Credentials and sessions use established authentication mechanisms and server-side checks.

**Acceptance Criteria:**

- AC-NFR-002-01: Passwords use a password-hashing algorithm such as bcrypt.
- AC-NFR-002-02: Production traffic uses HTTPS.
- AC-NFR-002-03: Authentication secrets are environment-only.
- AC-NFR-002-04: Authentication errors do not expose account existence or internals.

**Priority:** Must

**Traceability:** SPEC `F-001`, `F-006`.

### NFR-003 — Authorization Enforcement

**Category:** Security

**Description:** Every protected server operation verifies the current session and required permissions.

**Acceptance Criteria:**

- AC-NFR-003-01: Direct API requests cannot bypass role restrictions.
- AC-NFR-003-02: Client-provided role, creator, and actor fields are not trusted.
- AC-NFR-003-03: Positive and negative authorization tests cover each role.

**Priority:** Must

**Traceability:** SPEC `F-001`, `F-006`.

### NFR-004 — Input Validation

**Category:** Security / Reliability

**Description:** Bodies, path/query parameters, quantities, dates, and state transitions are validated server-side.

**Acceptance Criteria:**

- AC-NFR-004-01: Invalid payloads return structured validation errors.
- AC-NFR-004-02: Database details and stack traces are not exposed.
- AC-NFR-004-03: Quantity and monetary fields enforce valid ranges and precision.

**Priority:** Must

**Traceability:** SPEC `F-003`, `F-004`, `F-005`.

### NFR-005 — Responsive Usability

**Category:** Usability / Compatibility

**Description:** Core pages and workflows remain usable on mobile, tablet, and desktop.

**Acceptance Criteria:**

- AC-NFR-005-01: Core workflows work at 360 px without page-level horizontal overflow.
- AC-NFR-005-02: Tables scroll within a container or use a compact mobile layout.
- AC-NFR-005-03: Forms, dialogs, navigation, and charts work with touch input.
- AC-NFR-005-04: Dashboard information density is compact and consistent.

**Priority:** Must

**Traceability:** SPEC `F-002`, `F-003`, `F-004`.

### NFR-006 — Accessibility and Feedback

**Category:** Accessibility / Usability

**Description:** Controls provide accessible names, keyboard operation, visible focus, and clear asynchronous feedback.

**Acceptance Criteria:**

- AC-NFR-006-01: Form controls have labels and readable validation messages.
- AC-NFR-006-02: Dialogs support keyboard interaction and focus management.
- AC-NFR-006-03: Color is not the only status indicator.
- AC-NFR-006-04: Mutations show pending, success, and error feedback.

**Priority:** Must

**Traceability:** SPEC `F-002`, `F-004`, `F-006`.

### NFR-007 — Maintainability and Build Quality

**Category:** Maintainability

**Description:** The application uses typed modular code and reproducible dependency installation.

**Acceptance Criteria:**

- AC-NFR-007-01: TypeScript check passes.
- AC-NFR-007-02: ESLint completes without blocking errors.
- AC-NFR-007-03: Production build succeeds.
- AC-NFR-007-04: `pnpm-lock.yaml` is committed and used for reproducible installs.
- AC-NFR-007-05: Schema changes are represented by Prisma migrations.

**Priority:** Must

**Traceability:** All SPEC features.

### NFR-008 — Operational Error Handling

**Category:** Reliability

**Description:** Expected failures do not lose data unnecessarily or expose internal details.

**Acceptance Criteria:**

- AC-NFR-008-01: Validation, network, conflict, and server errors are distinguishable.
- AC-NFR-008-02: Failed mutations never show success feedback.
- AC-NFR-008-03: Recoverable operations can be retried safely.
- AC-NFR-008-04: Logs omit passwords, tokens, and secret values.

**Priority:** Must

**Traceability:** SPEC Section 10.

## 6. Requirement Priority Matrix

| ID      | Requirement                     | Type           | Priority | Release   |
|---------|---------------------------------|----------------|----------|-----------|
| FR-001  | Authenticate users              | Functional     | Must     | MVP       |
| FR-002  | Enforce role-based access       | Functional     | Must     | MVP       |
| FR-003  | Landing and sign-in             | Functional     | Must     | MVP       |
| FR-004  | Responsive role-aware dashboard | Functional     | Must     | MVP       |
| FR-005  | List masters                    | Functional     | Must     | MVP       |
| FR-006  | ADMIN master creation           | Functional     | Must     | MVP       |
| FR-007  | Catalog management              | Functional     | Should   | Important |
| FR-008  | List inventory movements        | Functional     | Must     | MVP       |
| FR-009  | Create inventory movement       | Functional     | Must     | MVP       |
| FR-010  | Daily balance chart             | Functional     | Must     | MVP       |
| FR-011  | Preserve movement history       | Functional     | Must     | MVP       |
| FR-012  | Manage orders                   | Functional     | Should   | Important |
| FR-013  | Record internal payments        | Functional     | Should   | Important |
| FR-014  | List users                      | Functional     | Must     | MVP       |
| FR-015  | Change user role                | Functional     | Must     | MVP       |
| FR-016  | Operational reports             | Functional     | Should   | Important |
| NFR-001 | Data integrity                  | Non-Functional | Must     | MVP       |
| NFR-002 | Authentication security         | Non-Functional | Must     | MVP       |
| NFR-003 | Authorization enforcement       | Non-Functional | Must     | MVP       |
| NFR-004 | Input validation                | Non-Functional | Must     | MVP       |
| NFR-005 | Responsive usability            | Non-Functional | Must     | MVP       |
| NFR-006 | Accessibility and feedback      | Non-Functional | Must     | MVP       |
| NFR-007 | Build quality                   | Non-Functional | Must     | MVP       |
| NFR-008 | Safe error handling             | Non-Functional | Must     | MVP       |

## 7. Constraints

### C-001 — Required Web Stack

Next.js, React, TypeScript, and Tailwind CSS are the application foundation required by the academic project.

### C-002 — Package Manager

`pnpm` manages dependencies and scripts; `pnpm-lock.yaml` is committed.

### C-003 — Persistence

Supabase PostgreSQL is the database service; Prisma provides typed data access and migrations.

### C-004 — Authentication and Roles

Auth.js manages sessions and roles are exactly `ADMIN` and `USER`.

### C-005 — UI System

The interface uses shadcn/ui with Base UI and the Mira preset.

### C-006 — Payment Boundary

Payments are internal records; live card processing and card-data storage are excluded.

## 8. Business Rules

- **BR-001:** ADMIN can manage users and create masters; USER can view masters/transactions and create movements.
- **BR-002:** Movement quantity is positive; `IN` or `OUT` determines direction.
- **BR-003:** Stock cannot become negative.
- **BR-004:** Actor identity comes from the authenticated session.
- **BR-005:** Movement insert and balance update are atomic.
- **BR-006:** Historical movements are append-only in ordinary workflows; corrections use compensating records.
- **BR-007:** Order totals are server-calculated.
- **BR-008:** Only `ADMIN` and `USER` are valid roles.
- **BR-009:** User listing and role changes require ADMIN.
- **BR-010:** Secrets and password hashes are never returned to clients or committed.

## 9. Edge Cases

| ID     | Scenario                             | Expected Behavior                           | Related Requirement    |
|--------|--------------------------------------|---------------------------------------------|------------------------|
| EC-001 | Outbound quantity exceeds stock      | Reject without changing stock               | FR-009                 |
| EC-002 | Concurrent movements                 | Preserve balance; return conflict if needed | FR-009, NFR-001        |
| EC-003 | Master has no movement history       | Show balance and useful chart state         | FR-010                 |
| EC-004 | USER calls admin endpoint directly   | Return 403                                  | FR-002, FR-006, FR-014 |
| EC-005 | Role changes during active session   | Enforce current role                        | FR-015, NFR-003        |
| EC-006 | Invalid report date range            | Return validation error                     | FR-016, NFR-004        |
| EC-007 | Record has historical references     | Deactivate instead of destructive deletion  | FR-007, FR-012         |
| EC-008 | Database failure mid-mutation        | Roll back transaction                       | FR-009, NFR-001        |
| EC-009 | Filter returns no records            | Show empty state                            | FR-005, FR-008, FR-014 |
| EC-010 | Last administrator attempts demotion | Reject operation                            | FR-015                 |

## 10. Out of Scope

| ID      | Excluded Item           | Reason                                      | Potential Future Release |
|---------|-------------------------|---------------------------------------------|--------------------------|
| OOS-001 | Live payment processing | Requires provider onboarding and compliance | Unknown                  |
| OOS-002 | Public online ordering  | Outside admin-focused assignment            | Unknown                  |
| OOS-003 | Delivery tracking       | Outside defined operations                  | Unknown                  |
| OOS-004 | Table reservations      | Not required by scope                       | Unknown                  |
| OOS-005 | Supplier procurement    | Adds purchasing workflows                   | Unknown                  |
| OOS-006 | Multi-branch operations | Requires cross-location rules               | Unknown                  |
| OOS-007 | Payroll/accounting      | Outside restaurant admin scope              | Unknown                  |
| OOS-008 | Native mobile apps      | Deliverable is responsive web               | Unknown                  |

## 11. Traceability Matrix

| SPEC Feature | User Flow      | Requirement | Acceptance Criteria | Task                 |
|--------------|----------------|-------------|---------------------|----------------------|
| F-001        | UF-001, UF-002 | FR-001      | AC-FR-001-01–04     | TASK-AUTH            |
| F-001        | UF-003         | FR-002      | AC-FR-002-01–05     | TASK-RBAC            |
| F-001        | UF-001         | FR-003      | AC-FR-003-01–03     | TASK-LANDING         |
| F-002        | UF-003, UF-004 | FR-004      | AC-FR-004-01–05     | TASK-SHELL           |
| F-003        | UF-005         | FR-005      | AC-FR-005-01–04     | TASK-MASTERS         |
| F-003        | UF-006         | FR-006      | AC-FR-006-01–06     | TASK-MASTER-CREATE   |
| F-003        | UF-007         | FR-007      | AC-FR-007-01–06     | TASK-CATALOG         |
| F-004        | UF-008         | FR-008      | AC-FR-008-01–05     | TASK-MOVEMENT-LIST   |
| F-004        | UF-009         | FR-009      | AC-FR-009-01–08     | TASK-MOVEMENT-CREATE |
| F-004        | UF-010         | FR-010      | AC-FR-010-01–05     | TASK-BALANCE-CHART   |
| F-004        | UF-009, UF-010 | FR-011      | AC-FR-011-01–04     | TASK-AUDIT           |
| F-005        | UF-011, UF-012 | FR-012      | AC-FR-012-01–05     | TASK-ORDERS          |
| F-005        | UF-013         | FR-013      | AC-FR-013-01–05     | TASK-PAYMENTS        |
| F-006        | UF-014         | FR-014      | AC-FR-014-01–04     | TASK-USERS           |
| F-006        | UF-015         | FR-015      | AC-FR-015-01–07     | TASK-ROLE-EDIT       |
| F-007        | UF-016, UF-017 | FR-016      | AC-FR-016-01–05     | TASK-REPORTS         |

## 12. Requirement Dependencies

| Requirement | Depends On                               | Reason                                                     |
|-------------|------------------------------------------|------------------------------------------------------------|
| FR-002      | FR-001                                   | Authorization requires authenticated identity              |
| FR-004      | FR-001, FR-002                           | Navigation depends on session and role                     |
| FR-005      | Database schema and authenticated access | Masters require persisted data                             |
| FR-006      | FR-001, FR-002, FR-005                   | Creation requires ADMIN and master persistence             |
| FR-007      | Database schema and validation           | Catalog relationships must remain valid                    |
| FR-008      | Masters and movement data model          | Movement listing references masters                        |
| FR-009      | FR-001, FR-002, FR-005, NFR-001          | Requires identity, permissions, master, atomic persistence |
| FR-010      | FR-008, FR-009                           | Chart derives from movement history                        |
| FR-012      | FR-007                                   | Orders reference catalog products                          |
| FR-013      | FR-012                                   | Payments reference orders                                  |
| FR-014      | FR-001, FR-002                           | User listing is administrator-only                         |
| FR-015      | FR-014, NFR-003                          | Role changes require administrator authorization           |
| FR-016      | FR-007, FR-009, FR-012, FR-013           | Reports aggregate operational data                         |

## 13. Open Questions

None are required to define the agreed scope. Deployment URLs and secrets are environment configuration values, not open product requirements.

## 14. Verification Strategy

- Unit tests for quantity validation, movement direction, order totals, role rules, and report aggregation.
- Integration tests for Prisma persistence, atomic movement creation, validation errors, and relations.
- Authentication tests for valid/invalid credentials, session handling, and sign-out.
- Authorization tests for allowed and denied operations by role.
- UI acceptance tests for navigation, dialogs, forms, toasts, tables, and charts.
- Responsive checks at mobile, tablet, and desktop widths.
- Build checks for TypeScript, ESLint, and production build.
- Security checks for secret scanning, request validation, and private response fields.
- End-to-end acceptance using one ADMIN and one USER demonstration account.

## 15. Related Documentation

- `SPEC.md`
- `SECURITY.md`
- `API.md`
- `DESIGNSYSTEM.md`
- `ARCHITECTURE.md` (maintained separately)
- `DATABASE.md` (maintained separately)
