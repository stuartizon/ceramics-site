# Ceramics/Fabrics Ecommerce Site

A monorepo ecommerce site built on [Medusa](https://www.medusajs.com) (headless commerce backend) and Next.js (storefront), selling pottery and fabrics to customers in Israel. Architecture priorities: self-hosted, open-source backend (no SaaS lock-in), managed Postgres for data integrity, low running cost, and a non-technical-friendly admin dashboard. Payments will integrate with Meshulam/Grow (planned, not yet implemented).

## Stack

- **Backend** (`backend`): Medusa v2, Node/TypeScript. Admin dashboard for product/order management.
- **Frontend** (`frontend`): Next.js 15, official Medusa storefront starter (cart, checkout, customer accounts, order history).
- **Local dev**: Postgres + Redis run in Docker via the root `docker-compose.yml`. Redis backs Medusa's cache, event bus, locking, and workflow engine modules — without it those fall back to in-memory implementations that don't survive a process restart, which risks leaving orders in an inconsistent state mid-checkout. Local dev intentionally mirrors this rather than running Redis-less.
- **Package manager**: npm (workspaces), orchestrated with [Turborepo](https://turbo.build).

## Prerequisites

- [Node.js](https://nodejs.org/) v20 (see `.nvmrc` — if using [nvm](https://github.com/nvm-sh/nvm), run `nvm use`; newer Node majors have had native-module compatibility issues with some Medusa dependencies)
- [Docker](https://www.docker.com/) (for local Postgres and Redis)
- npm v10+

## Getting Started (local development)

1. Clone the repository and install dependencies:

   ```bash
   git clone <this-repo-url>
   cd ceramics-site
   nvm use   # if using nvm
   npm install
   ```

2. Start local Postgres and Redis:

   ```bash
   docker compose up -d
   ```

3. Set up backend environment variables. The defaults already match the Docker services above, so no edits should be needed for local dev:

   ```bash
   cp backend/.env.template backend/.env
   ```

4. Run migrations. This also seeds store data (region, sales channel, categories, starter products) and, in development, creates a default admin user (`admin@example.com` / `password` — dev-only, never created outside `NODE_ENV=development`):

   ```bash
   cd backend
   npx medusa db:migrate
   ```

5. Start the Medusa backend:

   ```bash
   npx medusa develop
   ```

   Open the admin dashboard at `http://localhost:9000/app` and log in with `admin@example.com` / `password`. Grab a publishable API key from Settings > Publishable API Keys (the seed already creates a default one, viewable there).

6. Set up frontend environment variables, then fill in the publishable key from step 5:

   ```bash
   cd frontend
   cp .env.template .env.local
   # edit .env.local: set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
   ```

7. Start the frontend:

   ```bash
   npm run dev
   ```

   The frontend runs on `http://localhost:8000`.

Once both apps have been started once, you can run everything together from the repo root:

```bash
npm run dev
```

To stop the local Postgres/Redis containers: `docker compose down` (add `-v` to also delete their data volumes).

## Configuration

The frontend is configured via environment variables in `frontend/.env.local`:

| Variable | Description | Local default |
|----------|-------------|---------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Publishable API key from your Medusa backend | — (must be set) |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | URL of your Medusa backend | `http://localhost:9000` |
| `NEXT_PUBLIC_DEFAULT_REGION` | Default region country code | `il` |
| `NEXT_PUBLIC_BASE_URL` | Base URL of the storefront | `http://localhost:8000` |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key (optional, unused — payments are planned via Meshulam/Grow) | — |

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the backend deployment guide (Railway + Neon + Cloudflare R2).

## Resources

- [Medusa Documentation](https://docs.medusajs.com)
