# AssetFlow — Coding Standards Contract

Every file in this repository must follow these rules without exception.
These rules exist to ensure the codebase reads like experienced engineers wrote it,
not like generated output. Reviewers will evaluate code quality as the primary criterion.

---

## 1. Comment Placement

Comments go on the line immediately above the function, class, or statement they describe.
Zero comments inside a function body. The code must be self-documenting through naming.

```python
# Resolves the active allocation for the given asset
def get_active_allocation(asset_id: UUID) -> Allocation | None:
    ...
```

Never:
```python
def get_active_allocation(asset_id: UUID) -> Allocation | None:
    # query the db
    result = ...  # bad: inline comment
```

---

## 2. Blank Lines

- Two blank lines between top-level definitions (functions, classes) in Python.
- One blank line between methods inside a class.
- No trailing blank lines at end of file.
- One blank line after imports block before first definition.

---

## 3. Import Order (Python)

Three groups, each separated by one blank line:

```python
import uuid
from datetime import datetime

from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import UserRole
from app.shared.dependencies import get_current_user
```

Order: standard library → third-party → local application.

---

## 4. Import Order (TypeScript / React)

```typescript
import { useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import { Button } from '@/components/Button'
import type { Employee } from '@/types/employee'
```

Order: React/core → third-party → internal. Separate type imports last within each group.

---

## 5. Naming Conventions

### Python
- `snake_case` for variables, functions, module names, file names.
- `PascalCase` for classes.
- `SCREAMING_SNAKE_CASE` for true constants.
- No abbreviations: `department` not `dep`, `employee` not `emp`, `repository` not `repo`.
- Boolean variables use `is_` or `has_` prefix: `is_active`, `has_returned`.

### TypeScript
- `camelCase` for variables and functions.
- `PascalCase` for components, interfaces, and types.
- `SCREAMING_SNAKE_CASE` for constants in `utils/constants.ts`.

---

## 6. Type Annotations

Every Python function must have fully annotated parameters and return types.

```python
async def allocate_asset(
    asset_id: UUID,
    employee_id: UUID,
    session: AsyncSession,
) -> Allocation:
    ...
```

No bare `Any` in production code. Use `dict[str, str]` or proper models.

---

## 7. Function Length

Maximum 30 lines per function. If a function grows past this, extract a helper.
A function does one thing. Its name must make that obvious.

---

## 8. Layer Rules (Backend)

The three-tier rule is enforced strictly:

**Router layer** (`router.py`):
- Accepts HTTP request, calls one service method, returns the response.
- No database access. No business logic. No SQL.

**Service layer** (`service.py`):
- Orchestrates business logic. Calls repository methods. Validates domain rules.
- Raises domain exceptions (`ConflictError`, `NotFoundError`).
- No raw SQL. No direct `session.execute()` calls.

**Repository layer** (`repository.py`):
- Builds and executes SQLAlchemy queries. Returns ORM objects.
- No business logic. No HTTP concerns. No exception translation.

Crossing a layer boundary (router calling repository directly) is a bug.

---

## 9. No Over-Engineering

Do not add what the problem does not require:
- No abstract factory patterns.
- No plugin registries.
- No more than two levels of inheritance.
- No metaclasses.
- No dynamic code generation.

If you find yourself writing a decorator to generate a method that generates another method,
stop and write the straightforward version.

---

## 10. No Dead Code

- No `TODO`, `FIXME`, or `HACK` comments in committed code.
- No commented-out code blocks.
- No unused imports.
- No unused variables.

---

## 11. Error Handling

Use domain exceptions defined in `app/core/exceptions.py`. Never raise raw `HTTPException`
from a service or repository. The exceptions module maps domain errors to HTTP status codes.

```python
# services raise domain exceptions
raise NotFoundError("Asset", asset_id)

# the exception handler in main.py converts to HTTP 404
```

---

## 12. Pydantic Schemas

- Request schemas: suffix `Request` (e.g., `CreateAssetRequest`, `LoginRequest`).
- Response schemas: suffix `Response` (e.g., `AssetResponse`, `TokenResponse`).
- Update schemas: suffix `UpdateRequest` and use `Optional` fields only.
- All schemas inherit from `BaseSchema` in `app/shared/base_schema.py`.

---

## 13. Async

All FastAPI endpoints are `async def`. All service methods are `async def`.
All repository methods are `async def`. Use `await` consistently.
Never call sync DB operations from async context.

---

## 14. File Length

Aim for under 150 lines per file. If a file grows past 200 lines, consider splitting it.
Models that are genuinely related may share a file (e.g., `Allocation` and `TransferRequest`).

---

## 15. React Component Rules

- One component per file.
- Filename matches the component name: `AssetCard.tsx` exports `AssetCard`.
- No inline styles. Use CSS modules or Tailwind utility classes.
- `useState` and `useEffect` at the top of the component, before any conditional logic.
- Fetch data in hooks (`useAssets`, `useBookings`) not directly in components.

---

## 16. Git Commit Style

```
feat(assets): add overlap validation for bookings
fix(auth): return 401 when token is expired
chore: update pyproject.toml dependencies
```

Format: `type(scope): short imperative description`. No period at end.

---

These rules are the baseline. When in doubt, write less code, not more.
Clarity beats cleverness every time.
