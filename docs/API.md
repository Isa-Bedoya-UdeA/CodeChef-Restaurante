# Antorcha — API

## 1. Purpose

This document defines the HTTP API conventions, access rules, endpoint inventory, validation, response format, and error behavior for Antorcha. Route handlers validate untrusted browser input, verify sessions and permissions, call server-side business logic, access PostgreSQL through Prisma, and return explicit JSON responses.

## 2. API Overview

| Property        | Value                                                 |
|-----------------|-------------------------------------------------------|
| Protocol        | HTTPS in production; HTTP in local development        |
| Data Format     | JSON, except Auth.js provider flows                   |
| Consumers       | Antorcha web client and trusted server-side workflows |
| Backend         | Next.js App Router Route Handlers, TypeScript, Prisma |
| Database        | Supabase PostgreSQL                                   |
| Authentication  | Auth.js session                                       |
| Validation      | Zod on server-side inputs                             |
| Versioning      | Unversioned `/api` namespace for the academic release |
| Package Manager | pnpm                                                  |

## 3. Architecture and Boundaries

Route handlers live under `src/app/api/`. The browser never imports Prisma or connects directly to PostgreSQL. Shared authorization helpers enforce access rules; database transactions protect related changes that must succeed or fail together.

The academic “Masters” screen is represented by stock-bearing ingredient/material records, rather than a duplicate standalone master entity. Products are menu offerings; ingredients are materials used in preparation. Inventory movements are retained as history and are not edited/deleted through normal CRUD workflows.

## 4. Environments and Base URLs

| Environment | Base URL                     | Notes                                                          |
|-------------|------------------------------|----------------------------------------------------------------|
| Development | `http://localhost:3000`      | Local Next.js server                                           |
| Staging     | Not defined                  | No separate staging hostname is part of the configured release |
| Production  | Actual Vercel deployment URL | Hostname is determined by deployment configuration             |

All endpoint paths below are relative to the selected base URL.

## 5. Authentication

Protected endpoints require a valid Auth.js session. Auth.js handlers are mounted at `/api/auth/[...nextauth]`. Clients do not submit arbitrary user IDs or role values to establish identity. Missing or invalid sessions receive `401 Unauthorized`.

## 6. Authorization

| Role      | API permissions                                                                                                                                      |
|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| Anonymous | Public routes and Auth.js flows only                                                                                                                 |
| `USER`    | Read masters, catalog, inventory, movements, transactions, and permitted reports; create inventory movements; use permitted order/payment operations |
| `ADMIN`   | All USER operations plus master creation, user listing, and role changes                                                                             |

The policy is enforced by server handlers/services. Hiding a UI link does not secure an endpoint.

## 7. API Conventions

### Methods / Operations

- `GET` retrieves a collection or resource.
- `POST` creates a resource or records an explicit operation.
- `PATCH` updates supported fields or performs an explicit state change.
- `DELETE` is used only when removal preserves integrity and history.
- Inventory movement history is append-only in normal workflows; corrections use compensating movements.

### Naming

Resource paths use lowercase plural nouns. Dynamic IDs are represented as `{id}` in this document and `[id]` in Next.js folder names. Common query parameters include `page`, `pageSize`, `search`, `from`, `to`, `sortBy`, and `sortOrder` where supported.

### Headers

- `Content-Type: application/json` for JSON request bodies.
- `Accept: application/json` for JSON responses.
- Auth.js session cookies for authenticated requests.
- No custom client-supplied role header replaces session verification.

### Data Formats

- Dates/timestamps use ISO 8601 strings.
- IDs are opaque values defined by the Prisma schema.
- Quantities use validated numeric values with domain-appropriate precision.
- Monetary values use decimal-safe storage/serialization; clients do not provide authoritative totals.
- Password hashes, tokens, and secrets are excluded from API responses.

### Status Codes

| Code | Meaning               | Usage                                                    |
|-----:|-----------------------|----------------------------------------------------------|
|  200 | OK                    | Successful read or update                                |
|  201 | Created               | Resource or movement created                             |
|  204 | No Content            | Successful deletion where no response body is needed     |
|  400 | Bad Request           | Invalid body, path, or query parameters                  |
|  401 | Unauthorized          | Missing or invalid session                               |
|  403 | Forbidden             | Insufficient permissions                                 |
|  404 | Not Found             | Resource does not exist                                  |
|  409 | Conflict              | Invalid transition, duplicate, or business-rule conflict |
|  422 | Unprocessable Entity  | Domain rule violation where this distinction is used     |
|  429 | Too Many Requests     | Configured rate limit exceeded                           |
|  500 | Internal Server Error | Unexpected failure                                       |

## 8. Endpoints / Operations

The following is the endpoint contract inventory. Endpoint handlers support only the methods listed. Request bodies and query parameters are validated server-side.

### API-001 — Auth.js Handler

| Property           | Value                                                  |
|--------------------|--------------------------------------------------------|
| Method / Operation | `GET`, `POST`                                          |
| Path               | `/api/auth/[...nextauth]`                              |
| Purpose            | Auth.js sign-in, callback, session, and sign-out flows |
| Authentication     | Provider-dependent                                     |
| Authorization      | Auth.js configuration                                  |

**Parameters:** Auth.js-defined path, query, and body values. **Request/response:** Auth.js-defined. **Validation:** provider protocol and credentials flow. **Errors:** provider-defined sign-in error; unexpected failure is handled safely. **Side effects:** creates, reads, or invalidates session state. **Idempotency:** depends on operation. **Requirements:** FR-001, FR-003, NFR-002.

### API-002 — Products Collection

| Property           | Value                                                               |
|--------------------|---------------------------------------------------------------------|
| Method / Operation | `GET`, `POST`                                                       |
| Path               | `/api/products`                                                     |
| Purpose            | List/filter menu products and create a product                      |
| Authentication     | Required                                                            |
| Authorization      | Authenticated read; catalog mutation restricted to authorized staff |

**Parameters:** optional `page`, `pageSize`, `search`, `categoryId`, `active`.

**Request example:**

```json
{"name":"Antorcha Burger","description":"Grilled burger with cheese","price":"28000","categoryId":"category-id","active":true}
```

**Validation:** required bounded name; non-negative decimal-safe price; referenced category exists. **Success:** `200` collection or `201` created record, with `data` and optional `pagination`. **Errors:** `400`, `401`, `403`, `409`, `500`. **Side effects:** POST creates a product. **Idempotency:** GET is safe; POST is not inherently idempotent. **Requirements:** FR-007.

### API-003 — Product Item

| Property           | Value                                               |
|--------------------|-----------------------------------------------------|
| Method / Operation | `GET`, `PATCH`, `DELETE`                            |
| Path               | `/api/products/{id}`                                |
| Purpose            | Read or maintain one product                        |
| Authentication     | Required                                            |
| Authorization      | Authenticated read; mutations follow catalog policy |

**Parameters:** required path `id`. **Request:** PATCH accepts supported product fields only. **Validation:** record exists; historical order references prevent destructive deletion, so deactivation is preferred. **Success:** `200` with `data`; deletion may return `204`. **Errors:** `400`, `401`, `403`, `404`, `409`, `500`. **Side effects:** permitted metadata update or safe deactivation. **Idempotency:** GET safe; setting identical fields via PATCH is idempotent. **Requirements:** FR-007, NFR-001.

### API-004 — Categories Collection

| Property           | Value                                               |
|--------------------|-----------------------------------------------------|
| Method / Operation | `GET`, `POST`                                       |
| Path               | `/api/categories`                                   |
| Purpose            | List and create menu categories                     |
| Authentication     | Required                                            |
| Authorization      | Authenticated read; creation follows catalog policy |

**Parameters:** optional `page`, `pageSize`, `search`. **Request example:** `{"name":"Burgers","description":"Grilled burgers and specialties"}`. **Validation:** required name, configured uniqueness policy, no destructive removal of referenced categories. **Success:** `200` list or `201` created record. **Errors:** `400`, `401`, `403`, `409`, `500`. **Side effects:** POST creates category. **Idempotency:** GET safe; POST non-idempotent. **Requirements:** FR-007.

### API-005 — Category Item

| Property           | Value                                               |
|--------------------|-----------------------------------------------------|
| Method / Operation | `GET`, `PATCH`, `DELETE`                            |
| Path               | `/api/categories/{id}`                              |
| Purpose            | Read or maintain one category                       |
| Authentication     | Required                                            |
| Authorization      | Authenticated read; mutations follow catalog policy |

**Parameters:** path `id`. **Validation:** category exists; dependent products prevent destructive deletion. **Success:** `200` with `data`; safe deletion may return `204`. **Errors:** `400`, `401`, `403`, `404`, `409`, `500`. **Side effects:** update metadata or deactivate. **Idempotency:** GET safe; identical PATCH idempotent. **Requirements:** FR-007.

### API-006 — Ingredients / Masters Collection

| Property           | Value                                                 |
|--------------------|-------------------------------------------------------|
| Method / Operation | `GET`, `POST`                                         |
| Path               | `/api/ingredients`                                    |
| Purpose            | List stock-bearing master records and create a master |
| Authentication     | Required                                              |
| Authorization      | GET: ADMIN and USER; POST: ADMIN only                 |

**Parameters:** optional `page`, `pageSize`, `search`, `lowStock`.

**Request example:**

```json
{"name":"Cheddar cheese","unit":"g","initialBalance":5000}
```

**Validation:** name required and bounded; supported unit; non-negative initial balance; creator derived from session. USER creation attempts are rejected. **Success example**

```json
{"data":[{"id":"ingredient-id","name":"Cheddar cheese","unit":"g","balance":5000,"createdBy":{"id":"user-id","name":"Staff member"}}]}
```

**Errors:** `400`, `401`, `403`, `409`, `500`. **Side effects:** POST creates the master/ingredient and consistent initial stock state. **Idempotency:** GET safe; POST non-idempotent. **Requirements:** FR-005, FR-006, FR-007.

### API-007 — Ingredient / Master Item

| Property           | Value                                                                     |
|--------------------|---------------------------------------------------------------------------|
| Method / Operation | `GET`, `PATCH`, `DELETE`                                                  |
| Path               | `/api/ingredients/{id}`                                                   |
| Purpose            | Read or maintain a stock-bearing master                                   |
| Authentication     | Required                                                                  |
| Authorization      | Read: ADMIN/USER; mutation follows catalog policy and history constraints |

**Parameters:** path `id`. **Request:** PATCH accepts supported metadata such as name or active state; current balance cannot be arbitrarily overwritten. **Validation:** record exists; movement history is retained; records with history are deactivated rather than deleted. **Success:** `200` with `data`. **Errors:** `400`, `401`, `403`, `404`, `409`, `500`. **Side effects:** metadata update/deactivation. **Idempotency:** GET safe; repeated metadata update idempotent. **Requirements:** FR-005, FR-007, FR-011.

### API-008 — Inventory Collection

| Property           | Value                                     |
|--------------------|-------------------------------------------|
| Method / Operation | `GET`                                     |
| Path               | `/api/inventory`                          |
| Purpose            | List current stock balances and summaries |
| Authentication     | Required                                  |
| Authorization      | ADMIN, USER                               |

**Parameters:** optional `search`, `lowStock`, `page`, `pageSize`. **Request:** no body. **Validation:** filters normalized; pagination bounded. **Success:** `200` with `data` and optional pagination. **Errors:** `400`, `401`, `500`. **Side effects:** none. **Idempotency:** safe. **Requirements:** FR-005, FR-016.

### API-009 — Inventory Item

| Property           | Value                           |
|--------------------|---------------------------------|
| Method / Operation | `GET`                           |
| Path               | `/api/inventory/{id}`           |
| Purpose            | Read stock details for one item |
| Authentication     | Required                        |
| Authorization      | ADMIN, USER                     |

**Parameters:** path `id`. **Request:** no body. **Validation:** valid identifier and existing record. **Success:** `200` with item balance and unit. **Errors:** `400`, `401`, `404`, `500`. **Side effects:** none. **Idempotency:** safe. **Requirements:** FR-005, FR-008.

### API-010 — Inventory Movements Collection

| Property           | Value                                                      |
|--------------------|------------------------------------------------------------|
| Method / Operation | `GET`, `POST`                                              |
| Path               | `/api/inventory/movements`                                 |
| Purpose            | List movement history and record inbound/outbound movement |
| Authentication     | Required                                                   |
| Authorization      | ADMIN, USER                                                |

**Parameters:** optional `masterId`, `type`, `from`, `to`, `page`, `pageSize`.

**Request example:**

```json
{"masterId":"ingredient-id","type":"OUT","quantity":250,"note":"Kitchen preparation"}
```

**Validation:** master exists and is active; type is `IN` or `OUT`; quantity is positive; actor comes from session; outbound quantity cannot exceed stock; movement and balance update are atomic.

**Success example:**

```json
{"data":{"id":"movement-id","masterId":"ingredient-id","type":"OUT","quantity":250,"balanceAfter":4750,"createdAt":"2026-10-14T18:30:00.000Z","createdBy":{"id":"user-id","name":"Staff member"}}}
```

**Errors:** `400`, `401`, `403`, `404`, `409` (including insufficient stock/concurrent conflict), `500`. **Side effects:** POST creates immutable movement and changes balance atomically. **Idempotency:** GET safe; POST is not inherently idempotent and duplicate submission is prevented in the UI. **Requirements:** FR-008, FR-009, FR-011, NFR-001.

### API-011 — Inventory Movement Item

| Property           | Value                                          |
|--------------------|------------------------------------------------|
| Method / Operation | `GET`                                          |
| Path               | `/api/inventory/movements/{id}`                |
| Purpose            | Read one movement and its master/actor details |
| Authentication     | Required                                       |
| Authorization      | ADMIN, USER                                    |

**Parameters:** path `id`. **Request:** no body. **Validation:** movement exists. **Success:** `200` with movement details. **Errors:** `400`, `401`, `404`, `500`. **Side effects:** none; movement history is not edited/deleted through this route. **Idempotency:** safe. **Requirements:** FR-008, FR-011.

### API-012 — Orders Collection

| Property           | Value                                                   |
|--------------------|---------------------------------------------------------|
| Method / Operation | `GET`, `POST`                                           |
| Path               | `/api/orders`                                           |
| Purpose            | List orders and create orders from validated line items |
| Authentication     | Required                                                |
| Authorization      | Authorized operational staff                            |

**Parameters:** optional `status`, `from`, `to`, `page`, `pageSize`.

**Request example:**

```json
{"items":[{"productId":"product-id","quantity":2}],"notes":"No onions"}
```

**Validation:** at least one valid line item; products available; positive quantities; totals and prices calculated server-side. **Success:** `200` list or `201` created order with items, status, total, and timestamps. **Errors:** `400`, `401`, `403`, `404`, `409`, `500`. **Side effects:** creates order and lines in one transaction. **Idempotency:** GET safe; POST non-idempotent. **Requirements:** FR-012, NFR-001.

### API-013 — Order Item

| Property           | Value                                                                             |
|--------------------|-----------------------------------------------------------------------------------|
| Method / Operation | `GET`, `PATCH`, `DELETE`                                                          |
| Path               | `/api/orders/{id}`                                                                |
| Purpose            | Read or update permitted order fields                                             |
| Authentication     | Required                                                                          |
| Authorization      | Authorized operational staff; destructive deletion restricted when history exists |

**Parameters:** path `id`. **Request:** PATCH accepts permitted metadata only; status uses API-014. **Validation:** order exists; orders with payment/audit history are not destructively deleted. **Success:** `200` with order data. **Errors:** `400`, `401`, `403`, `404`, `409`, `500`. **Side effects:** updates permitted metadata. **Idempotency:** GET safe; setting identical metadata is idempotent. **Requirements:** FR-012.

### API-014 — Update Order Status

| Property           | Value                                             |
|--------------------|---------------------------------------------------|
| Method / Operation | `PATCH`                                           |
| Path               | `/api/orders/{id}/status`                         |
| Purpose            | Change order status through an allowed transition |
| Authentication     | Required                                          |
| Authorization      | Authorized operational staff                      |

**Parameters:** path `id`. **Request example:** `{"status":"PREPARING"}`. **Validation:** status is an allowed enum and transition from current state is permitted. **Success:** `200` with updated status and timestamp. **Errors:** `400`, `401`, `403`, `404`, `409`, `500`. **Side effects:** updates status. **Idempotency:** setting current status again is a no-op where policy permits. **Requirements:** FR-012.

### API-015 — Payments Collection

| Property           | Value                                   |
|--------------------|-----------------------------------------|
| Method / Operation | `GET`, `POST`                           |
| Path               | `/api/payments`                         |
| Purpose            | List and record internal payment events |
| Authentication     | Required                                |
| Authorization      | Authorized operational staff            |

**Parameters:** optional `orderId`, `status`, `page`, `pageSize`.

**Request example:**

```json
{"orderId":"order-id","amount":"56000","method":"CASH"}
```

**Validation:** order exists; amount is positive and follows outstanding-balance rules; method is an allowed enum; no card numbers, CVV, banking credentials, or raw payment tokens are accepted. **Success:** `200` list or `201` record. **Errors:** `400`, `401`, `403`, `404`, `409`, `500`. **Side effects:** creates payment record and updates related order payment state where applicable. **Idempotency:** GET safe; POST non-idempotent. **Requirements:** FR-013.

### API-016 — Payment Item

| Property           | Value                            |
|--------------------|----------------------------------|
| Method / Operation | `GET`                            |
| Path               | `/api/payments/{id}`             |
| Purpose            | Read one internal payment record |
| Authentication     | Required                         |
| Authorization      | Authorized operational staff     |

**Parameters:** path `id`. **Request:** no body. **Validation:** payment exists. **Success:** `200` with payment and order reference. **Errors:** `400`, `401`, `404`, `500`. **Side effects:** none; confirmed events are not silently edited/deleted. **Idempotency:** safe. **Requirements:** FR-013.

### API-017 — Transactions Collection

| Property           | Value                                                              |
|--------------------|--------------------------------------------------------------------|
| Method / Operation | `GET`                                                              |
| Path               | `/api/transactions`                                                |
| Purpose            | Provide a filterable view of recorded inventory/operational events |
| Authentication     | Required                                                           |
| Authorization      | ADMIN, USER                                                        |

**Parameters:** optional `masterId`, `type`, `from`, `to`, `page`, `pageSize`. **Request:** no body. **Validation:** date range, enums, and pagination are validated; results are derived from persisted events. **Success:** `200` with movement ID, date, type, quantity, master, responsible user, and pagination metadata. **Errors:** `400`, `401`, `500`. **Side effects:** none. **Idempotency:** safe. **Requirements:** FR-008, FR-010, FR-011.

### API-018 — Transaction Item

| Property           | Value                      |
|--------------------|----------------------------|
| Method / Operation | `GET`                      |
| Path               | `/api/transactions/{id}`   |
| Purpose            | Read one transaction entry |
| Authentication     | Required                   |
| Authorization      | ADMIN, USER                |

**Parameters:** path `id`. **Request:** no body. **Validation:** transaction exists and is visible to the caller. **Success:** `200` with transaction detail. **Errors:** `400`, `401`, `404`, `500`. **Side effects:** none. **Idempotency:** safe. **Requirements:** FR-008, FR-011.

### API-019 — Dashboard Summary

| Property           | Value                               |
|--------------------|-------------------------------------|
| Method / Operation | `GET`                               |
| Path               | `/api/reports`                      |
| Purpose            | Return high-level dashboard metrics |
| Authentication     | Required                            |
| Authorization      | ADMIN, USER                         |

**Parameters:** optional `from`, `to`. **Request:** no body. **Validation:** date range is valid/bounded; aggregations use persisted data. **Success example:** `{"data":{"ordersCount":0,"salesTotal":"0","inventoryItemsCount":0,"lowStockCount":0}}`. **Errors:** `400`, `401`, `500`. **Side effects:** none. **Idempotency:** safe. **Requirements:** FR-016.

### API-020 — Sales Report

| Property           | Value                                          |
|--------------------|------------------------------------------------|
| Method / Operation | `GET`                                          |
| Path               | `/api/reports/sales`                           |
| Purpose            | Return sales aggregates grouped by time period |
| Authentication     | Required                                       |
| Authorization      | ADMIN, USER                                    |

**Parameters:** required `from`, `to`; optional `groupBy` (`day`, `week`, `month`). **Validation:** ordered bounded date range and supported grouping; configured timezone. **Success:** `200` with periods, order counts, and sales totals. **Errors:** `400`, `401`, `500`. **Side effects:** none. **Idempotency:** safe. **Requirements:** FR-016.

### API-021 — Inventory Report

| Property           | Value                                    |
|--------------------|------------------------------------------|
| Method / Operation | `GET`                                    |
| Path               | `/api/reports/inventory`                 |
| Purpose            | Return balances and low-stock indicators |
| Authentication     | Required                                 |
| Authorization      | ADMIN, USER                              |

**Parameters:** optional `lowStock`, `page`, `pageSize`. **Validation:** bounded pagination; low-stock uses configured thresholds. **Success:** `200` with item, unit, balance, and low-stock status. **Errors:** `400`, `401`, `500`. **Side effects:** none. **Idempotency:** safe. **Requirements:** FR-016.

### API-022 — Top Products Report

| Property           | Value                                             |
|--------------------|---------------------------------------------------|
| Method / Operation | `GET`                                             |
| Path               | `/api/reports/top-products`                       |
| Purpose            | Return top-selling products for a selected period |
| Authentication     | Required                                          |
| Authorization      | ADMIN, USER                                       |

**Parameters:** optional `from`, `to`, and bounded `limit`. **Validation:** valid date range and positive capped limit; ranking metric is consistent. **Success:** `200` with product ID/name, units sold, and sales total. **Errors:** `400`, `401`, `500`. **Side effects:** none. **Idempotency:** safe. **Requirements:** FR-016.

### API-023 — Users Collection

| Property           | Value                                 |
|--------------------|---------------------------------------|
| Method / Operation | `GET`                                 |
| Path               | `/api/users`                          |
| Purpose            | List user accounts for administration |
| Authentication     | Required                              |
| Authorization      | ADMIN only                            |

**Parameters:** optional `page`, `pageSize`, `search`. **Request:** no body. **Validation:** ADMIN role; bounded pagination; password hashes and private authentication fields excluded. **Success example**

```json
{"data":[{"id":"user-id","email":"staff@example.com","name":"Staff member","role":"USER","createdAt":"2026-10-14T18:30:00.000Z"}],"pagination":{"page":1,"pageSize":20,"total":1}}
```

**Errors:** `400`, `401`, `403`, `500`. **Side effects:** none. **Idempotency:** safe. **Requirements:** FR-014, NFR-003.

### API-024 — User Item

| Property           | Value                           |
|--------------------|---------------------------------|
| Method / Operation | `GET`, `PATCH`, `DELETE`        |
| Path               | `/api/users/{id}`               |
| Purpose            | Read or maintain a user account |
| Authentication     | Required                        |
| Authorization      | ADMIN only                      |

**Parameters:** path `id`. **Request example:** `{"role":"ADMIN"}`. **Validation:** role must be `ADMIN` or `USER`; supported fields only; unsafe self-demotion and removal/demotion of the last administrator are rejected; users with audit references are deactivated rather than destructively deleted. **Success:** `200` with public user fields. **Errors:** `400`, `401`, `403`, `404`, `409`, `500`. **Side effects:** role update or safe deactivation. **Idempotency:** GET safe; setting the same role is idempotent. **Requirements:** FR-014, FR-015, NFR-003.

## 9. Data Schemas

The Prisma schema is the canonical data model. The following fields describe public API objects; internal/private fields are excluded.

### Schema — User

| Field       | Type         | Required | Nullable | Description       |
|-------------|--------------|---------:|---------:|-------------------|
| `id`        | ID           |      Yes |       No | User identifier   |
| `email`     | String       |      Yes |       No | Login email       |
| `name`      | String       |       No |      Yes | Display name      |
| `role`      | Enum         |      Yes |       No | `ADMIN` or `USER` |
| `createdAt` | ISO datetime |      Yes |       No | Creation time     |

### Schema — Master / Ingredient

| Field         | Type           | Required | Nullable | Description              |
|---------------|----------------|---------:|---------:|--------------------------|
| `id`          | ID             |      Yes |       No | Master identifier        |
| `name`        | String         |      Yes |       No | Ingredient/material name |
| `unit`        | String/enum    |      Yes |       No | Inventory unit           |
| `balance`     | Decimal/number |      Yes |       No | Current balance          |
| `createdById` | ID             |      Yes |       No | Authenticated creator    |
| `createdAt`   | ISO datetime   |      Yes |       No | Creation time            |
| `active`      | Boolean        |      Yes |       No | Availability flag        |

### Schema — Inventory Movement

| Field          | Type           | Required | Nullable | Description                         |
|----------------|----------------|---------:|---------:|-------------------------------------|
| `id`           | ID             |      Yes |       No | Movement identifier                 |
| `masterId`     | ID             |      Yes |       No | Related master                      |
| `type`         | Enum           |      Yes |       No | `IN` or `OUT`                       |
| `quantity`     | Decimal/number |      Yes |       No | Positive quantity                   |
| `balanceAfter` | Decimal/number |      Yes |       No | Balance after movement, when stored |
| `createdById`  | ID             |      Yes |       No | Authenticated actor                 |
| `createdAt`    | ISO datetime   |      Yes |       No | Movement timestamp                  |
| `note`         | String         |       No |      Yes | Optional explanation                |

### Schema — Product

| Field         | Type    | Required | Nullable | Description         |
|---------------|---------|---------:|---------:|---------------------|
| `id`          | ID      |      Yes |       No | Product identifier  |
| `name`        | String  |      Yes |       No | Menu name           |
| `description` | String  |       No |      Yes | Product description |
| `price`       | Decimal |      Yes |       No | Stored unit price   |
| `categoryId`  | ID      |       No |      Yes | Related category    |
| `active`      | Boolean |      Yes |       No | Availability flag   |

### Schema — Order

| Field         | Type         | Required | Nullable | Description             |
|---------------|--------------|---------:|---------:|-------------------------|
| `id`          | ID           |      Yes |       No | Order identifier        |
| `status`      | Enum         |      Yes |       No | Current state           |
| `items`       | Array        |      Yes |       No | Order line items        |
| `total`       | Decimal      |      Yes |       No | Server-calculated total |
| `createdAt`   | ISO datetime |      Yes |       No | Creation time           |
| `createdById` | ID           |       No |      Yes | User who recorded it    |

### Schema — Payment

| Field       | Type         | Required | Nullable | Description             |
|-------------|--------------|---------:|---------:|-------------------------|
| `id`        | ID           |      Yes |       No | Payment identifier      |
| `orderId`   | ID           |      Yes |       No | Related order           |
| `amount`    | Decimal      |      Yes |       No | Recorded amount         |
| `method`    | Enum         |      Yes |       No | Internal payment method |
| `status`    | Enum         |      Yes |       No | Internal record state   |
| `createdAt` | ISO datetime |      Yes |       No | Record timestamp        |

## 10. Validation

- Zod validates bodies, route IDs, query parameters, and enum values.
- Pagination is positive and bounded.
- Date ranges are valid, ordered, and bounded.
- Quantities are positive and respect unit precision.
- Outbound movements check balance inside the database transaction.
- Monetary arithmetic uses decimal-safe values and server-calculated totals.
- Foreign keys reference existing records.
- Actor/creator IDs come from the session.
- Protected fields such as `createdById`, inventory balance, and computed totals cannot be overwritten through unrelated endpoints.

## 11. Error Handling

### Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data.",
    "details": [{"field": "quantity", "message": "Quantity must be greater than zero."}],
    "requestId": "request-id"
  }
}
```

`details` and `requestId` appear when useful. Internal exceptions and database details are never returned.

### Error Categories

- `VALIDATION_ERROR` — malformed or invalid request.
- `UNAUTHENTICATED` — missing or invalid session.
- `FORBIDDEN` — insufficient permission.
- `NOT_FOUND` — resource does not exist.
- `CONFLICT` — duplicate, concurrency, or state conflict.
- `INSUFFICIENT_STOCK` — outbound quantity exceeds balance.
- `INVALID_TRANSITION` — requested state transition is not allowed.
- `RATE_LIMITED` — configured request limit exceeded.
- `INTERNAL_ERROR` — unexpected server-side failure.

## 12. Pagination, Filtering, and Sorting

### Pagination

Collection endpoints use `page` and `pageSize` where applicable. Pages start at 1 and page size is capped by a server-defined maximum. Paginated responses include metadata.

### Filtering

Supported filters depend on endpoint and include `search`, `categoryId`, `masterId`, `type`, `status`, `from`, `to`, `lowStock`, and `active`. Each handler validates its supported filters.

### Sorting

Movement/transaction histories default to the newest first. User-provided sort fields are allowlisted and are never interpolated into raw SQL.

## 13. Idempotency and Retries

- GET operations are safe and idempotent.
- Repeating a PATCH that sets the same values is idempotent when it triggers no additional side effect.
- POST operations are not inherently idempotent.
- UI submit buttons are disabled while mutations are pending.
- Clients do not blindly retry ambiguous create requests.
- Inventory and order writes use transactions to prevent partial state.
- A formal idempotency-key mechanism is not part of the defined release contract.

## 14. Rate Limiting

| Scope                 | Limit                                       | Response   | Notes                                        |
|-----------------------|---------------------------------------------|------------|----------------------------------------------|
| Sign-in               | Configured deployment limit                 | 429        | Protects credential endpoint where supported |
| User administration   | Configured deployment limit                 | 429        | ADMIN-only endpoints                         |
| Mutating API requests | Configured deployment limit where supported | 429        | Limits abuse and accidental repeats          |
| Read/report endpoints | Bounded pagination/query ranges             | 400 or 429 | Prevents unbounded queries                   |

Numeric limits are deployment configuration, not fixed contract values.

## 15. Versioning and Compatibility

The academic release uses `/api` without a version prefix. Backward-incompatible changes are coordinated with the web client and recorded in the changelog. A version prefix is introduced only when independently versioned clients require it.

## 16. External Integrations

| Provider            | Purpose                    | Authentication                         | Data                               | Failure Behavior                   | Documentation          |
|---------------------|----------------------------|----------------------------------------|------------------------------------|------------------------------------|------------------------|
| Supabase PostgreSQL | Persistent database        | Server-side connection string          | Application records                | Safe error; no partial transaction | Supabase documentation |
| Auth.js             | Authentication/session     | Auth.js configuration and secret       | Identity/session                   | Generic authentication error       | Auth.js documentation  |
| Vercel              | Hosting/environment config | Project access and deployment settings | Build artifacts/environment values | Safe deployment failure            | Vercel documentation   |

No live payment processor is integrated.

## 17. Security

- Every protected endpoint verifies session and role.
- All untrusted input is validated server-side.
- Responses exclude hashes, tokens, and secrets.
- Database access is server-only.
- Inventory updates use transactions and stock invariants.
- Client-provided totals and actor IDs are not trusted.
- Error responses avoid internal details.
- Production uses HTTPS.

See `SECURITY.md` for the complete security model.

## 18. Testing and Contract Verification

| Test           | Purpose                                        | Required |
|----------------|------------------------------------------------|----------|
| Unit           | Domain rules and calculations                  | Yes      |
| Integration    | Prisma persistence and transactions            | Yes      |
| Contract       | Request/response schemas and status codes      | Yes      |
| Authentication | Valid/invalid sessions                         | Yes      |
| Authorization  | ADMIN/USER permissions                         | Yes      |
| Validation     | Malformed and boundary inputs                  | Yes      |
| Error handling | Safe, consistent responses                     | Yes      |
| Concurrency    | Stock consistency under simultaneous movements | Yes      |

## 19. Changelog / Evolution

| Version | Date       | Change                                         |
|---------|------------|------------------------------------------------|
| 1.0     | 2026-10-14 | Initial consolidated API contract for Antorcha |

## 20. Related Documentation

- `REQUIREMENTS.md`
- `SPEC.md`
- `SECURITY.md`
- `DESIGNSYSTEM.md`
