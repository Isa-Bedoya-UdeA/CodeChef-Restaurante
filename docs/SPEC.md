# Antorcha — Product Specification

| Field        | Value                 |
|--------------|-----------------------|
| Project      | Antorcha              |
| Document     | Specification         |
| Version      | 1.0                   |
| Status       | Approved              |
| Last Updated | 2026-10-14            |
| Owner        | Antorcha project team |

## 1. Overview

### 1.1 Product Summary

Antorcha is a responsive administration web application for a fictional restaurant bar specializing in grilled food, burgers, skewers, fries, and meat-and-cheese dishes. It centralizes menu catalog, ingredient masters, inventory movements, orders, internal payment records, transactions, reports, and user access in one dashboard.

### 1.2 Problem Statement

Restaurant staff need consistent stock records, traceable inventory changes, and clear operational information. Disconnected manual records make it difficult to identify who changed stock, understand daily balances, and protect administrative operations. Antorcha centralizes these workflows and attributes each inventory movement to the authenticated user who recorded it.

### 1.3 Target Users

| User    | Description                            | Primary Goal                                                    |
|---------|----------------------------------------|-----------------------------------------------------------------|
| Visitor | Person viewing the public landing page | Learn about Antorcha and open sign-in                           |
| USER    | Authenticated operational staff member | Review masters and transactions; record inventory movements     |
| ADMIN   | Authenticated administrator            | Use operational features, create masters, and manage user roles |

### 1.4 Product Vision

Antorcha provides a reliable, approachable, and visually warm operational workspace that makes restaurant inventory and transaction activity easier to manage across desktop, tablet, and mobile devices.

---

## 2. Product Scope

### 2.1 In Scope

- Public landing page with a sign-in entry point.
- Auth.js authentication and role-based access for `ADMIN` and `USER`.
- Responsive dashboard with user identity and role-aware sidebar.
- Master records for inventory-bearing materials/ingredients.
- Product and category catalog.
- Inventory balances and traceable inbound/outbound movements.
- Transaction table showing movement ID, date, quantity, type, and responsible user.
- Daily balance-evolution chart for the selected master.
- Order records and line items.
- Internal payment records associated with orders; no live payment processor.
- User listing and role editing for administrators.
- Dashboard summary, sales, inventory, and top-product reports.
- Loading, validation, success, error, and empty states.
- Supabase PostgreSQL persistence through Prisma; deployment on Vercel.
- Project README and setup instructions.

### 2.2 Out of Scope

- Live card processing, banking integrations, or storage of card data.
- Public online ordering, delivery tracking, customer accounts, or table reservations.
- Payroll, supplier procurement, accounting, and multi-branch operations.
- Native mobile applications and restaurant POS hardware integration.
- Loyalty programs, coupons, and marketing automation.

### 2.3 Constraints

- Next.js, React, TypeScript, Tailwind CSS, Supabase PostgreSQL, Prisma, and Auth.js form the application stack.
- `pnpm` is the package manager and `pnpm-lock.yaml` is version-controlled.
- The interface uses shadcn/ui configured with Base UI and the Mira preset.
- Roles are exactly `ADMIN` and `USER`.
- The required academic workflows include landing/sign-in, sidebar, transactions, masters, and user administration.
- Secrets and environment-specific credentials are not committed to source control.

### 2.4 Assumptions

- Antorcha is an internal administration tool for the fictional restaurant bar.
- The academic “Masters” screen is represented by stock-bearing ingredient/material records; it is not a separate duplicate entity.
- Products represent menu offerings; ingredients represent materials used in preparation.
- Payment records are internal operational records and do not imply live payment processing.
- Production hostname, credentials, and environment values are deployment configuration, not fixed product data.

---

## 3. Functional Overview

### 3.1 Authentication and Access

Visitors can view the landing page and sign-in screen. Authenticated users access dashboard pages according to their role. Protected server operations verify sessions and permissions before returning data or performing mutations.

### 3.2 Dashboard and Navigation

The dashboard identifies the signed-in user and provides navigation to Transactions and Masters for both roles. Users navigation appears only for administrators. Desktop navigation uses a persistent sidebar; smaller screens use compact responsive navigation.

### 3.3 Masters and Menu Catalog

Master records represent inventory-bearing materials and expose identifier, name, current balance, and creator. Products and categories describe menu offerings. Both roles can view masters; only administrators can create them.

### 3.4 Inventory and Transactions

Users select a master, review movement history, and record inbound or outbound movements. Each movement includes quantity, date, type, master, and responsible user. A chart displays daily balance evolution for the selected master.

### 3.5 Orders and Payments

Orders contain line items, statuses, and server-calculated totals. Payment records represent internal payment events associated with orders. No card data is collected or processed.

### 3.6 Users and Reports

Administrators list users and update their roles. Reports aggregate stored operational data into sales summaries, inventory indicators, and top-product results.

---

## 4. Core Features

### F-001 — Authentication and Role-Based Access

#### 4.1.1 Purpose

Protect administrative data and separate operational permissions from administrator-only functions.

#### 4.1.2 Description

Auth.js establishes sessions. Users have the role `ADMIN` or `USER`. Public routes remain accessible without a session; protected pages and API operations require valid authentication and sufficient permissions.

#### 4.1.3 Primary Users

- USER
- ADMIN

#### 4.1.4 Expected Outcome

Only authorized users can access protected functionality.

#### 4.1.5 Related User Flows

- UF-001: Sign in.
- UF-002: Sign out.
- UF-003: Open the dashboard according to role.

#### 4.1.6 Related Requirements

- `REQUIREMENTS.md`: FR-001, FR-002, FR-003, NFR-002, NFR-003.

### F-002 — Dashboard and Responsive Navigation

#### 4.2.1 Purpose

Provide a consistent entry point to restaurant operations.

#### 4.2.2 Description

The authenticated shell displays user identity, role-appropriate navigation, page headings, and operational summaries. Layouts adapt to desktop, tablet, and mobile screens.

#### 4.2.3 Primary Users

- USER
- ADMIN

#### 4.2.4 Expected Outcome

Users can locate permitted modules and understand their current context.

#### 4.2.5 Related User Flows

- UF-003: Open the dashboard.
- UF-004: Navigate to a module.

#### 4.2.6 Related Requirements

- `REQUIREMENTS.md`: FR-004, NFR-005, NFR-006.

### F-003 — Masters and Menu Catalog

#### 4.3.1 Purpose

Maintain consistent records for inventory materials and menu offerings.

#### 4.3.2 Description

The master table shows identifier, name, current balance, and creator. Both roles can view masters; only ADMIN can create them. Products, categories, and ingredients maintain the restaurant catalog and stock-bearing materials.

#### 4.3.3 Primary Users

- USER
- ADMIN

#### 4.3.4 Expected Outcome

Staff use consistent catalog and inventory records, with master creation restricted to administrators.

#### 4.3.5 Related User Flows

- UF-005: Browse masters.
- UF-006: Create a master as ADMIN.
- UF-007: Maintain catalog records.

#### 4.3.6 Related Requirements

- `REQUIREMENTS.md`: FR-005, FR-006, FR-007.

### F-004 — Inventory Movements and Balance History

#### 4.4.1 Purpose

Make stock changes traceable and display daily balance evolution.

#### 4.4.2 Description

Users select a master, view its movement history, and create inbound or outbound movements. Every movement records type, positive quantity, date, and authenticated actor. Successful creation closes the dialog and refreshes the table and chart.

#### 4.4.3 Primary Users

- USER
- ADMIN

#### 4.4.4 Expected Outcome

Balances reflect valid movements and each movement has an accountable user.

#### 4.4.5 Related User Flows

- UF-008: Review movements.
- UF-009: Register a movement.
- UF-010: Review balance history.

#### 4.4.6 Related Requirements

- `REQUIREMENTS.md`: FR-008, FR-009, FR-010, FR-011, NFR-001, NFR-004.

### F-005 — Orders and Payment Records

#### 4.5.1 Purpose

Represent orders and related payment records in one operational system.

#### 4.5.2 Description

Authorized staff review orders, inspect line items, update allowed statuses, and record internal payment events. The application does not process live card payments.

#### 4.5.3 Primary Users

- USER
- ADMIN

#### 4.5.4 Expected Outcome

Order and payment information remains consistent and traceable.

#### 4.5.5 Related User Flows

- UF-011: Review an order.
- UF-012: Update order status.
- UF-013: Record a payment.

#### 4.5.6 Related Requirements

- `REQUIREMENTS.md`: FR-012, FR-013.

### F-006 — User Administration

#### 4.6.1 Purpose

Allow administrators to manage role assignments safely.

#### 4.6.2 Description

The Users page shows user ID, creation date, email, and role. Administrators edit a role through a dialog with loading and success/error feedback; the table refreshes after success.

#### 4.6.3 Primary Users

- ADMIN

#### 4.6.4 Expected Outcome

Roles remain manageable and protected by server-side authorization.

#### 4.6.5 Related User Flows

- UF-014: List users.
- UF-015: Change a user's role.

#### 4.6.6 Related Requirements

- `REQUIREMENTS.md`: FR-014, FR-015, NFR-002, NFR-003.

### F-007 — Operational Reports

#### 4.7.1 Purpose

Summarize restaurant activity for efficient review.

#### 4.7.2 Description

Reports provide date-filtered sales summaries, inventory indicators, and top-product results based on persisted records. Empty ranges display meaningful empty states.

#### 4.7.3 Primary Users

- USER
- ADMIN

#### 4.7.4 Expected Outcome

Authorized staff can review operational trends without manually aggregating tables.

#### 4.7.5 Related User Flows

- UF-016: Review dashboard summary.
- UF-017: Filter a report.

#### 4.7.6 Related Requirements

- `REQUIREMENTS.md`: FR-016, NFR-001.

---

## 5. User Flows

The user journeys for Antorcha are identified as UF-001 through UF-017: authentication, dashboard navigation, master management, inventory movements, order/payment records, user administration, and reports. A separate `USERJOURNEY.md` is not included in this documentation package.

## 6. Product Requirements

`REQUIREMENTS.md` is the authoritative source for functional and non-functional requirements, acceptance criteria, priorities, constraints, and traceability.

## 7. Feature Prioritization

### MVP

- Landing page and sign-in.
- Auth.js session and `ADMIN`/`USER` authorization.
- Responsive dashboard and role-aware sidebar.
- Master listing and administrator-only master creation.
- Inventory movement creation for both roles.
- Movement table with responsible user and date.
- Daily balance-evolution chart.
- Administrator user listing and role editing.
- Supabase persistence through Prisma.
- Loading, success, error, and empty states.
- README, environment configuration, and Vercel deployment.

### Important

- Product and category catalog.
- Ingredient-to-product relationships.
- Order and internal payment records.
- Sales and inventory reports.
- Search, filtering, pagination, and sorting where useful.

### Stretch

- Advanced report filters and exports.
- Low-stock indicators and optional notifications.
- Additional audit views and operational summaries.

### Out of Scope

- Live payment processing.
- Customer-facing ordering, delivery, and reservations.
- Payroll, supplier purchasing, and multi-branch management.

---

## 8. Product Rules

- `ADMIN` has access to all application functions, including user administration and master creation.
- `USER` can view transactions and masters and create inventory movements, but cannot administer users or create masters.
- UI visibility does not replace server-side authorization.
- Every movement is associated with the authenticated user who created it.
- Movement quantities are positive; direction is represented by movement type.
- An outbound movement cannot reduce stock below zero.
- Movement creation and balance updates are atomic.
- Historical movements are retained; corrections use compensating adjustment movements.
- Order totals are calculated on the server from validated line items and stored prices.
- Payment records reference an existing order and do not store card data.
- Roles are restricted to `ADMIN` and `USER`.
- Reports use the configured application timezone and validated date ranges.

## 9. Edge Cases

### 9.1 Insufficient Inventory

**Condition:** An outbound movement exceeds the current balance.

**Expected Behavior:** Reject the operation, leave the balance unchanged, and show a validation message.

### 9.2 Concurrent Movements

**Condition:** Multiple users record movements against the same master simultaneously.

**Expected Behavior:** Transactions and consistency checks preserve a valid balance; a conflicting operation can be retried after refresh.

### 9.3 Master Without Movement History

**Condition:** A master has an initial balance but no later movements.

**Expected Behavior:** Show the current balance and a useful starting/empty chart state.

### 9.4 Role Changed During an Active Session

**Condition:** An administrator changes a user's role while that user is signed in.

**Expected Behavior:** Protected operations use a current trusted role and do not preserve elevated privileges from stale client state.

### 9.5 Empty Report Range

**Condition:** No records match the selected dates.

**Expected Behavior:** Display zero values or an informative empty state.

## 10. Error and Failure Behavior

| Scenario                 | Expected User-Visible Behavior         | Recovery                                              |
|--------------------------|----------------------------------------|-------------------------------------------------------|
| Invalid credentials      | Generic sign-in error                  | Re-enter credentials or use configured recovery       |
| Missing/expired session  | Redirect to sign-in                    | Sign in again                                         |
| Insufficient permissions | Access-denied message or safe redirect | Use an authorized account or contact an administrator |
| Invalid form data        | Field-level validation messages        | Correct highlighted fields                            |
| Insufficient stock       | Movement rejected with explanation     | Refresh balance and enter a valid quantity            |
| Network/server failure   | Non-destructive error notification     | Retry after connectivity returns                      |
| Conflicting update       | Conflict message and refreshed data    | Review the current record                             |
| Empty results            | Clear empty state                      | Change filters or add records                         |
| Database unavailable     | Generic service error                  | Retry later; inspect secured server logs              |

## 11. Product Metrics / Success Criteria

| Metric                      | Target                                                | Measurement                       |
|-----------------------------|-------------------------------------------------------|-----------------------------------|
| Required academic workflows | All required flows pass acceptance checks             | Manual acceptance checklist       |
| Role enforcement            | All protected operations reject unauthorized requests | Authorization tests               |
| Inventory consistency       | No successful operation creates negative stock        | Unit/integration tests            |
| Movement accountability     | Every movement stores its authenticated actor         | API/database tests                |
| Responsive usability        | Core pages work at 360 px, tablet, and desktop widths | Responsive UI review              |
| Mutation feedback           | Mutations show pending and success/error feedback     | UI acceptance tests               |
| Build quality               | Type check, lint, and production build pass           | CI checks                         |
| Secret hygiene              | No secrets committed to source control                | Secret scan and repository review |

## 12. Related Documentation

- `REQUIREMENTS.md`
- `SECURITY.md`
- `API.md`
- `DESIGNSYSTEM.md`
