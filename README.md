# Matrix HRMS

![CI](https://github.com/mmshareef24/hrms/actions/workflows/ci.yml/badge.svg)

Vite + React application for the HRMS Matrix project, styled with Tailwind and using Radix UI components. Database is modeled for Supabase/PostgreSQL with comprehensive modules (Employees, T&A, Leave, Payroll, Loans, Travel & Expense, Documents, Onboarding, Approvals).

## Quick Start

```bash
npm install
npm run dev
```

- Dev server runs at `http://localhost:5173/`.
- Uses local mock API by default; no external accounts needed.

## Build

```bash
npm run build
```

Outputs production bundle to `dist/`.

## Supabase Schema & Migrations

- Full schema: `supabase/schema.sql`
- Initial migration: `supabase/migrations/20251109_initial_hrms.sql`

### Apply via CLI (recommended when DNS works)

```bash
# Set project ref once
npx supabase link --project-ref <PROJECT_REF>
# Or use direct DB URL
npx supabase db push --db-url "postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres"
```

### Apply via SQL Editor (workaround)

Paste `supabase/schema.sql` into Supabase SQL editor and run. Verify tables and enums afterward.

## CI Workflow

- GitHub Actions runs lint and build on pushes/PRs to `main`.
- Artifacts upload `dist/` for inspection.

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint across the repo

## Contributing

1. Create a new branch from `main`.
2. Run `npm run lint` and `npm run build` locally.
3. Open a PR; CI must pass.

## License

Proprietary internal project. Do not redistribute.