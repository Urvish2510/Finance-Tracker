# Personal Finance Tracker

Full‑stack personal finance tracking application: Vue 3 frontend + Express/Mongo backend with analytics, budgeting, and comprehensive automated tests (Vitest + Supertest). All server behaviors documented and enforced by tests.

## Features

### 📊 Dashboard
- Overview of financial stats
- Quick expense summaries
- Recent activity feed
- Visual spending charts

### 💳 Expense Management
- Add, edit, and delete expenses
- Categorize transactions
- Date range filtering
- Search functionality

### 🏷️ Category Management
- Create custom expense categories
- Color-coded organization
- Category statistics
- Edit and manage categories

### 📈 Analytics
- Interactive spending charts
- Category breakdown
- Monthly trends
- Smart financial insights
- Data export functionality

### ⚙️ Settings
- Appearance customization
- Currency and format preferences
- Notification settings
- Data import/export
- Backup and restore

## Tech Stack

Frontend:
- Vue 3, Vue Router, Chart.js / vue-chartjs, Vite

Backend:
- Express 5, Mongoose 8 (MongoDB; in‑memory fallback for tests), dotenv

Testing:
- Vitest, @testing-library/vue, Supertest, mongodb-memory-server, happy-dom/jsdom

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Frontend + Backend (dev)**
   ```bash
   npm run dev:full
   ```
   Or run separately:
   ```bash
   npm run server:dev
   npm run dev
   ```

3. **Build Frontend**
   ```bash
   npm run build
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## Project Structure (Key)

```
server/
   controllers/        # Express route handlers
   models/             # Mongoose schemas
   routes/             # Route definitions (mounted in server.js)
   database.js         # Connection / in-memory fallback
src/                  # Vue 3 application
tests/                # Vitest (unit, client, integration, e2e)
docs/                 # API.md & openapi.yaml
```

## Data Storage

- Primary: MongoDB (configure `MONGODB_URI`).
- Fallback (when `MONGODB_URI` absent): Ephemeral in‑memory Mongo via mongodb-memory-server — enables zero‑config demos & deterministic test runs.

## Environment Variables

Create `.env` (optional):
```
MONGODB_URI=mongodb://localhost:27017/finance_tracker
PORT=5000
NODE_ENV=development
```
If unset, in‑memory mode logs a warning and data is non‑persistent.

## Testing

```
npm run test:all         # server + client + integration + e2e
npm run test:integration # server integration + e2e workflows
npm run test:server      # backend unit
npm run test:client      # vue component tests
```

All mission‑critical flows (budget thresholds, month filters, CRUD consistency, error recovery) are covered.

## API & Docs

Human-readable: `docs/API.md`

OpenAPI: `docs/openapi.yaml`

Key points:
- Analytics time filters: month (`?month=YYYY-MM`), custom range (`?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`), rolling period (`?period=week|month|quarter|year`)
- Budget status thresholds: safe (<70%), warning (70–<90%), critical (90–<100%), over (≥100%)
- Settings POST (201) create/upsert; PUT (200) update
- Expenses & deposits populate `category` and add `categoryId`

## Development Workflow

1. Add/modify tests first (red)
2. Implement feature/fix (green)
3. Refactor (still green)

## Contributing

PRs welcome. Ensure `npm run test:all` passes and update docs if API changes.

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern browsers with IndexedDB support

## License

MIT.

---

**Track smarter. Ship confidently. 💰**
