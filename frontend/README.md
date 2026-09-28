# Dosie — Frontend

Web dashboard for caregivers to manage patients, medications, schedules, and
alerts for the Dosie medication-monitoring system.

## Tech Stack

| Concern         | Technology                    |
| --------------- | ----------------------------- |
| Build tool      | Vite                          |
| Language        | TypeScript                    |
| UI              | React 19                      |
| Routing         | React Router                  |
| HTTP client     | Axios (manual data fetching)  |
| Forms + validation | React Hook Form + Zod      |
| Styling         | Tailwind CSS v4               |

UI components are hand-written (no component library).

## Development

```bash
npm install          # from the repo root (npm workspaces)
npm run dev:frontend # or: npm run dev  (inside frontend/)
```

The dev server proxies `/api/*` to the backend at `http://localhost:3000`,
stripping the `/api` prefix (e.g. `/api/auth/login` -> `/auth/login`).

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
- `npm run lint` — run Oxlint

## Path alias

`@/` resolves to `src/` (e.g. `import { api } from '@/lib/api'`).