## Finance Tracker API Documentation

Behavior enforced by automated Vitest + Supertest integration & e2e workflow tests.

Base URL: `http://localhost:5000`

### Resources
| Resource | Path | Notes |
|----------|------|-------|
| Health | /health | Uptime & env info |
| Categories | /api/categories | Expense / income classification |
| Expenses | /api/expenses | Outgoing transactions |
| Deposits | /api/deposits | Incoming transactions |
| Settings | /api/settings | Single user preferences & budget |
| Analytics | /api/analytics | Summary & budget status |

### Conventions
* JSON everywhere.
* ObjectId strings as identifiers.
* Expenses/Deposits include populated `category` plus `categoryId` alias.
* Dates ISO 8601; create defaults to now if omitted.

### Status Codes (Core)
| Operation | 2xx | 4xx Validation | 404 |
|-----------|-----|----------------|-----|
| Create expense/deposit | 201 | 400 | — |
| Update expense/deposit | 200 | 400 | 404 |
| Delete expense/deposit | 200 | — | 404 |
| Create settings (POST) | 201 | 400 | — |
| Update settings (PUT) | 200 | 400 | — |
| Analytics summary bad month | — | 400 | — |

### Health
GET `/health` → 200
```
{ status, timestamp, uptime, message, environment, version }
```

### Categories
POST `/api/categories` { name, icon, color, type? } → 201
GET `/api/categories` → 200 `[Category]`
DELETE `/api/categories/:id` → 400 if linked expenses exist, else 200 (404 if missing)

### Expenses
POST `/api/expenses`
Required: `amount`, `category|categoryId`
Optional: `title` (fallback order: title → description → "Expense"), `description`, `date`, `currency`
Response includes: populated `category`, `categoryId`
PUT `/api/expenses/:id` partial update; retains omitted fields
GET `/api/expenses/:id` → 200 or 404
DELETE `/api/expenses/:id` → 200 or 404

### Deposits (Income)
POST `/api/deposits` required: `amount`, `category|categoryId`; title fallback order: title → source → description → "Deposit"
PUT `/api/deposits/:id` partial; 404 if missing
Other semantics mirror expenses.

### Settings
Single document: `userId = "default"`
GET `/api/settings` → auto‑creates defaults if absent
POST `/api/settings` → 201 (create/upsert)
PUT `/api/settings` → 200 (update)
Validation: currency in (`INR`,`USD`,`EUR`,`GBP`,`JPY`,`CAD`,`AUD`,`SGD`,`CNY`,`KRW`); theme in (`light`,`dark`,`auto`)

### Analytics
GET `/api/analytics/summary` supports time selection via one of:
- `month=YYYY-MM`
- `startDate=ISO&endDate=ISO`
- `period=week|month|quarter|year` (rolling window ending now)

Response range object:
```
range: {
	month: null | '2024-01',
	period: null | 'week'|'month'|'quarter'|'year',
	startDate: ISO or null,
	endDate: ISO or null
}
```
Returns expense & deposit totals + balance + expense category breakdown only.
GET `/api/analytics/budget-status` → `{ budgetLimit, currentExpenses, remainingBudget, isOverBudget, warningLevel }`
Warning thresholds: `<0.7=safe`, `0.7–<0.9=warning`, `0.9–<1=critical`, `>=1=over`

### Error Patterns
| Case | Status | Example |
|------|--------|---------|
| Invalid month format | 400 | `{ "error":"Invalid month format. Use YYYY-MM" }` |
| Invalid currency/theme | 400 | `{ "error":"Invalid currency" }` |
| Missing amount/category | 400 | `{ "error":"Amount and category are required" }` |
| Invalid category id on create/update | 400 | `{ "error":"Invalid category" }` |
| Nonexistent resource update/delete | 404 | `{ "error":"Expense not found" }` |

### Sample Flow (from e2e tests)
1. POST settings
2. POST 3 categories
3. POST deposits & expenses
4. GET `/api/analytics/summary`
5. GET `/api/analytics/budget-status`

### Testing Coverage Map
| Workflow | Ensures |
|----------|---------|
| Full session | Core CRUD + analytics + budget |
| Multi-month | Month filtering correctness |
| Budget management | Threshold transitions |
| Data consistency | Updates & deletions recalc totals |
| Error recovery | System stability after invalid ops |
| Preferences | Settings persistence + budget interaction |

### OpenAPI
See `openapi.yaml` for machine-readable specification.

### Future Enhancements
Multi-user auth, pagination, extended trend analytics (partial logic lives in `analyticsController`).
