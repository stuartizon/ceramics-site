# Deployment

The backend deploys to Railway, the frontend to Vercel — two independent
pipelines, matching how `backend/` and `frontend/` are two independent
projects in this repo (see the root README's "Package manager" note on why
they're not npm workspaces).

## Backend (Railway)

Architecture: GitHub Actions builds the backend's Docker image
(`.github/workflows/backend-docker.yml`) and pushes it to the GitHub Container
Registry (GHCR) on every push to `main` that touches the backend. Railway deploys
that pre-built image rather than building it itself.

This two-step split exists because Railway's own build environment repeatedly
stalled and was killed silently (no error, just gone after ~20 minutes) trying to
`npm ci` the backend's dependencies — root-caused to npm registry latency on
`@medusajs/*` package metadata, not anything fixable in the Dockerfile. GitHub
Actions has no such timeout and gives full build logs, plus a persistent build
cache (`type=gha`) across runs, so it reliably finishes in a few minutes once
warm. Railway's job is then just "pull an image and run it," which is fast and
has never failed.

Postgres is hosted on [Neon](https://neon.com) rather than Railway's own
Postgres, since Neon autoscales compute to zero when idle — Railway bills RAM
24/7 even while idle, which is wasteful for a low-traffic store. Redis stays on
Railway itself, co-located with the backend, because Medusa's workflow engine/event
bus/locking/caching modules make several Redis round trips per request — latency
that compounds badly over a public network to an external Redis, unlike the
occasional Postgres query. Object storage is
[Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible, no egress
fees), since Railway has no object storage product worth using for this yet.

### 1. Neon (Postgres)

1. Sign up at [neon.com](https://neon.com) (free tier, no card required).
2. Create a project. Pick the region closest to Israel that's offered.
3. From the project dashboard, copy the **pooled** connection string — this is
   `DATABASE_URL`.

### 2. Cloudflare R2 (object storage)

1. Sign up / log in to Cloudflare, open R2.
2. Create a bucket (e.g. `ceramics-media`).
3. Enable public access on the bucket — either the `r2.dev` subdomain Cloudflare
   generates, or a custom domain. This gives you the public base URL for
   `S3_FILE_URL`.
4. Create an R2 API token scoped to this bucket (read + write). This gives you
   `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`.
5. Note the S3 API endpoint, `https://<account_id>.r2.cloudflarestorage.com` —
   this is `S3_ENDPOINT`.
6. `S3_REGION` can be `auto` for R2. `S3_BUCKET` is the bucket name from step 2.

### 3. GitHub Actions → GHCR

Nothing to configure here beyond the workflow file already in the repo — it
authenticates to GHCR with the automatically-provided `GITHUB_TOKEN`, and pushes
`ghcr.io/stuartizon/ceramics-site-backend:latest` (and a `:<sha>` tag) on every
push to `main` that touches `backend/**` (or via manual "Run workflow").

One manual one-time step: the package GHCR creates on first push defaults to
private. Go to the package's page (GitHub → your account → Packages →
`ceramics-site-backend`) → Package settings → change visibility to **Public**.
This repo does it this way (rather than giving Railway a registry credential)
since the repo itself is already public — no new exposure, and it avoids
managing another secret.

After the image push, the workflow also runs `railway redeploy --from-source`
to tell Railway to pull that fresh image and deploy it — this is what removes
the old need to manually click "Redeploy" in the Railway dashboard after
every backend change. Setting up the token and variable this step needs is
covered in §4 below, once the backend service actually exists to point at.

### 4. Railway project + backend service

1. Sign up at [railway.app](https://railway.app).
2. New Project → Empty Project, then add a service via **Deploy → Docker
   Image**, and give it `ghcr.io/stuartizon/ceramics-site-backend:latest`.
   (Don't use "Deploy from GitHub repo" — that has Railway build the Dockerfile
   itself, which is the slow/unreliable path this architecture avoids.)
3. In the same project, add a Redis plugin (New → Database → Add Redis).
4. On the backend service's Variables tab, reference the Redis plugin's URL
   (`${{Redis.REDIS_URL}}`) into `REDIS_URL`.
5. Settings → Deploy: clear out any auto-detected **Custom Start Command**. If
   the service was ever previously connected as a git-based (Railpack) deploy,
   a stale start command can persist here even after switching the source to a
   Docker image, and it silently overrides the image's own `CMD` — it crash
   loops if left in place.
6. Settings → Deploy → **Pre-Deploy Command**: set it to `npx medusa
   db:migrate`. This runs once per deploy, between build and start, and
   handles both schema migrations and the data-seeding "migration scripts"
   under `backend/src/migration-scripts/` (see note in §6 below on what those
   seed).
7. Wire up GitHub Actions to trigger Railway deploys automatically (see §3
   above for what this enables). A project token is scoped to a project +
   environment but not to a single service, and this Railway project also
   contains the Redis plugin as a separate service, so both a token and an
   explicit service name are needed:
   - In Railway: the backend service → Settings → Tokens (or project
     Settings → Tokens) → create a **Project Token** scoped to the
     Production environment.
   - In this GitHub repo → Settings → Secrets and variables → Actions:
     - **Secret** `RAILWAY_TOKEN`: the token from the previous step.
     - **Variable** `RAILWAY_BACKEND_SERVICE`: the backend service's name
       (or ID) in Railway — this tells `redeploy` which of the project's
       services to target, since the token alone only identifies the
       project/environment.

### 5. Environment variables

Set these on the backend service (see `backend/.env.template` for the full list
used locally):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `REDIS_URL` | Reference to the Railway Redis plugin |
| `JWT_SECRET` | Fresh random secret (not the `supersecret` dev value) |
| `COOKIE_SECRET` | Fresh random secret |
| `STORE_CORS` / `ADMIN_CORS` / `AUTH_CORS` | Placeholder until the frontend has a URL; update once it's deployed |
| `S3_FILE_URL` / `S3_ENDPOINT` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_REGION` / `S3_BUCKET` | From the R2 setup above |

`DB_NAME` in `.env.template` is unused by `medusa-config.ts` (the database name is
already encoded in `DATABASE_URL`) — no need to set it here. Don't set `PORT` —
Railway injects it itself and Medusa reads it automatically.

### 6. First deploy

1. Push to `main` (or manually run the GHA workflow) to get an image onto
   GHCR. The workflow's final step (set up in §4.7 above) then tells Railway
   to pull and deploy that image itself — no manual Railway dashboard step
   needed for routine backend changes after that's wired up. For this very
   first deploy, do one manual Deploy from the Railway dashboard to get the
   service running initially, since the GHA-triggered redeploy step needs a
   service that already exists.
2. Settings → Networking → Generate Domain, to get a public URL for the
   backend.
3. **Check the generated domain's target port matches what the app actually
   listens on.** The domain's target port is set once, at generation time, and
   does not track the container automatically — if it's ever wrong (e.g. left
   over from an earlier Railpack-based setup that used a different port), every
   route returns a `502 Application failed to respond` from Railway's edge, even
   `/health`. Check the deploy logs for the line `Server is ready on port: N`
   and make sure Networking's target port matches `N` (Railway typically
   injects `PORT=8080`).
4. The Pre-Deploy Command from §4.6 handles schema migrations and catalog
   seeding automatically on this and every subsequent deploy — nothing manual
   needed here. The seed data (categories, a handful of demo products,
   inventory, bundles) is meant to double as real initial catalog content, not
   just dev fixtures; it only runs once per script (Medusa tracks completed
   migration scripts and skips them on future deploys), so once the site admin
   edits/removes seeded products through the admin UI, redeploys won't
   overwrite those changes.
5. Create a real admin user (the dev-only seed admin doesn't fire in
   production, since the Dockerfile sets `NODE_ENV=production`). `railway run`
   won't work for this — it only forwards env vars to your local shell, and
   `REDIS_URL` points at `redis.railway.internal`, a private hostname only
   resolvable from inside Railway's network. Instead, get a shell actually
   inside the running container, either via the Railway dashboard's built-in
   terminal (look for a terminal tab/icon on the service) or the CLI:
   ```bash
   railway login
   railway link   # select this project/service
   railway ssh
   # now inside the container:
   npx medusa user -e you@example.com -p <password>
   ```

### 7. Verify

- `curl https://<backend-domain>/health` → `200`
- Log into `https://<backend-domain>/app` with the admin user from step 6.5.
- Create a publishable API key (Settings → Publishable API Keys) — the frontend
  will need this.
- Upload a product image via the admin to confirm R2 is wired correctly
  end-to-end.

## Frontend (Vercel)

The frontend deploys straight from the GitHub repo — no Docker, no custom
build pipeline. `frontend/` is a fully standalone project (its own
`package-lock.json`, not an npm workspace — see the root README's "Package
manager" note), so Vercel's zero-config Next.js detection works out of the
box with no custom install/build command needed.

### 1. Project setup

1. [vercel.com/new](https://vercel.com/new) → Import Git Repository → select
   this repo (install/authorize the Vercel GitHub App if prompted).
2. **Root Directory**: set to `frontend`. Vercel auto-detects Next.js from
   there.
3. Leave the Build/Install/Output Settings on their defaults — nothing to
   override. (If you ever see a custom Install Command set here, clear it —
   an earlier iteration of this deploy briefly needed one to work around npm
   workspace hoisting, before the workspace split made it unnecessary.)

### 2. Environment variables

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | The `pk_...` key from the backend admin (Settings → Publishable API Keys) |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | The Railway backend's public domain, e.g. `https://ceramics-sitebackend-production.up.railway.app` |
| `NEXT_PUBLIC_DEFAULT_REGION` | `il` |
| `NEXT_PUBLIC_BASE_URL` | The Vercel-assigned domain, e.g. `https://<project-name>.vercel.app` (predictable from the project name before the first deploy) — update if a custom domain is added later |

Leave `NEXT_PUBLIC_STRIPE_KEY` and the two `MEDUSA_CLOUD_*` vars empty — unused.

### 3. Deploy, then close the loop on CORS

Deploy. Once you have the real Vercel domain, go back to the Railway backend
service and update `STORE_CORS` / `AUTH_CORS` (Backend §5 above) to include
it, then redeploy the backend — otherwise the storefront's requests get
blocked by CORS even though both sides are individually up.

### 4. Product images and R2

`frontend/next.config.js`'s `images.remotePatterns` explicitly allowlists
`*.r2.dev` (Cloudflare R2's public dev URL, from Backend §2). `next/image`
enforces this list regardless of the `unoptimized` setting — if the bucket's
public URL ever moves off `r2.dev` to a custom domain, add a matching
`remotePatterns` entry or product images will silently fail to load.

### 5. Verify

- The Vercel URL loads and product images render (confirms the R2 domain
  allowlist above is correct).
- Add to cart and checkout round-trip successfully against the Railway
  backend (confirms CORS is actually configured, not just that both sides
  independently load).
