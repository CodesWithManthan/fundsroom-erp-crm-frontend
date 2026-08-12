# ERP + CRM Frontend — Fundsroom Infotech Assignment

React + TypeScript frontend for a mini ERP/CRM internal operations tool. Pairs with the [backend API](https://github.com/CodesWithManthan/fundsroom-erp-crm-backend).

**Live app:** https://fundsroom-erp-crm-frontend.vercel.app
**Backend repo:** https://github.com/CodesWithManthan/fundsroom-erp-crm-backend

## Tech Stack

- React + TypeScript (Vite)
- Plain `fetch()` calls + `useState`/`useContext` — no Redux, no component library, no animation libraries (deliberate choice, matches the assignment brief's "functional over polished" guidance)
- react-router-dom for routing
- Deployed on Vercel

## Architecture Overview

- **`src/context/AuthContext.tsx`** — holds the JWT token and logged-in user in React state, persisted to `localStorage` so a page refresh doesn't log the user out. Exposes `login()`/`logout()`.
- **`src/api/client.ts`** — shared `authFetch` helper that attaches the `Authorization: Bearer <token>` header to every request and centralizes error handling, so every module's API file doesn't repeat that logic.
- **`src/api/{customers,products,challans,auth}.ts`** — one file per module, thin wrappers around `authFetch` with typed request/response shapes matching the backend exactly.
- **`src/pages/`** — one list page, one create/edit form page (shared for both via a `useParams` check), and one detail page per module. Challans additionally has PDF download on the detail page.
- Routing is protected via a `ProtectedRoute` wrapper that redirects to `/login` if no token is present — this is a UX convenience only; the real access control is enforced server-side via the backend's `requireRole` middleware.

### A few real design decisions worth mentioning

- **Draft challans can exceed available stock; only Confirm enforces stock limits.** This matches a real sales workflow — a draft can be prepared before stock physically arrives, and only committing (confirming) needs to be blocked by real-world constraints.
- **Challan PDFs are stamped "DRAFT — NOT YET CONFIRMED" or "CANCELLED — NOT VALID"** when downloaded in those states, so a non-final document can never be mistaken for an official delivery record if shared or printed.
- Product edit forms disable the stock field — stock is only ever changed via the dedicated stock-adjustment action (which logs a movement), never as a silent side effect of editing product details.

## Environment Variables

Create a `.env` file in the project root for local development:
VITE_API_URL=http://localhost:5000
In production (Vercel), `VITE_API_URL` is set to the live Railway backend URL. Vite bakes environment variables into the build at build time, so changing this value requires a fresh deploy/rebuild to take effect, not just a restart.

## Running Locally

```bash
git clone https://github.com/CodesWithManthan/fundsroom-erp-crm-frontend.git
cd fundsroom-erp-crm-frontend
npm install
```

Create your `.env` file as shown above. Make sure the [backend](https://github.com/CodesWithManthan/fundsroom-erp-crm-backend) is running locally too (both need to run simultaneously, in separate terminals).

```bash
npm run dev
```

Visit `http://localhost:5173`.

## Deployment

- **Platform:** Vercel (free tier)
- Framework preset: Vite (auto-detected)
- Environment variable set in Vercel's dashboard: `VITE_API_URL` = live backend URL, scoped to Production

## Test Credentials

See the [backend README](https://github.com/CodesWithManthan/fundsroom-erp-crm-backend) for all 4 role logins.

## Known Limitations

- No mobile-responsive design — this is an internal desktop admin tool, not a customer-facing product, matching the assignment brief's scope.
- Role-based UI hiding (e.g. hiding buttons a role can't use) is partially implemented as a UX nicety; the actual security boundary is enforced by the backend regardless of what the frontend shows or hides.
- No automated frontend tests — verified manually across all 4 roles and all 4 modules during development.
- Free-tier backend hosting means the very first request after inactivity may take 20-30 seconds (cold start) — a loading state is shown during this, but it can feel slow on first load of a session.
