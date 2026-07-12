# AssetFlow — API Reference

## Base URL

```
http://localhost:8000/api/v1
```

Interactive docs (Swagger UI): `http://localhost:8000/api/v1/docs`

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <access_token>
```

Access tokens expire in **60 minutes**. Use `/auth/refresh` to get a new pair without re-logging in.

---

## Common Error Shape

Every error response uses this shape:

```json
{ "detail": "Human-readable message" }
```

Validation errors (422) return an array:

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Enter a valid email address.",
      "type": "value_error"
    }
  ]
}
```

---

## Roles

| Value | Who |
|---|---|
| `admin` | Seeded on first boot. Manages org, promotes roles. |
| `asset_manager` | Registers assets, approves transfers & maintenance. |
| `department_head` | Views dept assets, approves dept transfers. |
| `employee` | Default role for every self-registered user. |

> **Rule:** signup always creates `employee`. Only an Admin can promote a role via `PATCH /employees/{id}/role`.

---

## Feature 1 — Auth Endpoints

---

### POST `/auth/register`

Creates a new Employee account. Role is always `employee` — no exceptions.

**Request**

```json
{
  "email": "priya@example.com",
  "password": "secret123",
  "first_name": "Priya",
  "last_name": "Sharma",
  "phone": "+91-9876543210"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | yes | Normalised to lowercase. Must contain `@` and a domain. |
| `password` | string | yes | Minimum 8 characters. |
| `first_name` | string | yes | |
| `last_name` | string | yes | |
| `phone` | string | no | |

**Response `201 Created`**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "priya@example.com",
    "first_name": "Priya",
    "last_name": "Sharma",
    "role": "employee",
    "department_id": null
  }
}
```

**Errors**

| Status | `detail` | When |
|---|---|---|
| 409 | `An account with email '...' already exists.` | Email already registered |
| 422 | validation array | Bad email format or password < 8 chars |

---

### POST `/auth/login`

Authenticates a user and returns tokens + profile.

**Request**

```json
{
  "email": "priya@example.com",
  "password": "secret123"
}
```

**Response `200 OK`**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "priya@example.com",
    "first_name": "Priya",
    "last_name": "Sharma",
    "role": "employee",
    "department_id": "a1b2c3d4-..."
  }
}
```

> **Frontend tip:** store `user.role` immediately after login — use it to decide which dashboard/routes to render. No second round-trip needed.

**Errors**

| Status | `detail` | When |
|---|---|---|
| 401 | `Invalid email or password.` | Wrong credentials |
| 401 | `Your account has been deactivated.` | Admin deactivated the account |

---

### POST `/auth/refresh`

Issues a fresh token pair. Call this when the access token expires (60 min) using the stored refresh token (valid 7 days).

**Request**

```json
{
  "refresh_token": "eyJ..."
}
```

**Response `200 OK`**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

> Replace both tokens in storage — the old refresh token is still technically valid but treat it as rotated.

**Errors**

| Status | `detail` | When |
|---|---|---|
| 401 | `Refresh token is invalid or expired.` | Token tampered or older than 7 days |
| 401 | `Account is inactive or no longer exists.` | Admin deactivated user between sessions |

---

### GET `/auth/me`

Returns the currently authenticated user's profile. Use this on app load to restore session state.

**Headers**

```
Authorization: Bearer <access_token>
```

**Response `200 OK`**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "priya@example.com",
  "first_name": "Priya",
  "last_name": "Sharma",
  "role": "employee",
  "department_id": "a1b2c3d4-..."
}
```

**Errors**

| Status | `detail` | When |
|---|---|---|
| 403 | — | No token provided |
| 401 | `Authentication credentials are missing or invalid.` | Token invalid or expired |
| 401 | `Account no longer exists.` | User deleted after token was issued |

---

### POST `/auth/forgot-password`

Generates a short-lived password reset token (valid 15 minutes).

> **Demo note:** The reset token is returned directly in the response body. In production this would be emailed instead.

**Request**

```json
{
  "email": "priya@example.com"
}
```

**Response `200 OK` — email found**

```json
{
  "reset_token": "eyJ...",
  "message": "Use this token at POST /auth/reset-password to set a new password."
}
```

**Response `200 OK` — email not found**

```json
{
  "reset_token": null,
  "message": "If an account with that email exists, a reset token has been generated."
}
```

> Both cases return 200 to prevent user enumeration. Check if `reset_token` is non-null before showing it to the user.

---

### POST `/auth/reset-password`

Sets a new password using the token from `/auth/forgot-password`. Token expires after 15 minutes.

**Request**

```json
{
  "token": "eyJ...",
  "new_password": "mynewpass99"
}
```

**Response `204 No Content`**

No body returned. On success, redirect the user to login.

**Errors**

| Status | `detail` | When |
|---|---|---|
| 401 | `Password reset token is invalid or expired.` | Token wrong or > 15 min old |
| 404 | `Employee with identifier '...' was not found.` | Account deleted after token issued |
| 422 | validation array | `new_password` < 8 chars |

---

### POST `/auth/change-password`

Changes the password for the currently logged-in user. Requires current password for verification.

**Headers**

```
Authorization: Bearer <access_token>
```

**Request**

```json
{
  "current_password": "secret123",
  "new_password": "mynewpass99"
}
```

**Response `204 No Content`**

No body returned.

**Errors**

| Status | `detail` | When |
|---|---|---|
| 401 | `Current password is incorrect.` | Wrong current password |
| 403 | — | No token provided |
| 422 | validation array | `new_password` < 8 chars |

---

## Admin Bootstrap

The first Admin account is **seeded automatically on server startup** — no API call needed.

**Default credentials (from `.env`):**

```
email:    admin@assetflow.com
password: Admin@1234
```

Login with these to get an `admin`-role token, then use `PATCH /employees/{id}/role` to promote employees.

---

## Admin — Promote Employee Role

### PATCH `/employees/{id}/role`

**Auth:** Admin only

**Headers**

```
Authorization: Bearer <admin_access_token>
```

**Request**

```json
{
  "role": "asset_manager"
}
```

Valid role values: `asset_manager`, `department_head`, `employee`

**Response `200 OK`** — returns the full updated employee object.

```json
{
  "id": "3fa85f64-...",
  "email": "priya@example.com",
  "first_name": "Priya",
  "last_name": "Sharma",
  "phone": null,
  "role": "asset_manager",
  "status": "active",
  "department_id": null,
  "created_at": "2026-07-12T11:00:00Z",
  "updated_at": "2026-07-12T11:30:00Z"
}
```

**Errors**

| Status | `detail` | When |
|---|---|---|
| 403 | `You cannot change your own role.` | Admin tried to demote themselves |
| 403 | `You do not have permission...` | Caller is not Admin |
| 404 | `Employee with identifier '...' was not found.` | Bad UUID |

---

## Frontend Integration Checklist

- [ ] On register/login: store `access_token`, `refresh_token`, and `user` object in app state (Zustand / localStorage)
- [ ] On every API request: attach `Authorization: Bearer <access_token>` header
- [ ] On 401 response: call `POST /auth/refresh` with the stored refresh token, retry the original request with the new access token
- [ ] On app load / page refresh: call `GET /auth/me` to restore session; if it fails, redirect to login
- [ ] Use `user.role` to conditionally render routes, nav items, and action buttons
- [ ] On logout: clear both tokens and the user object from state
