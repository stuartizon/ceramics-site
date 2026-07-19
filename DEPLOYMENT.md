# Deploying the backend to Railway

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

Frontend deployment is a separate, not-yet-made decision — this doc covers the
backend only.

## 1. Neon (Postgres)

1. Sign up at [neon.com](https://neon.com) (free tier, no card required).
2. Create a project. Pick the region closest to Israel that's offered.
3. From the project dashboard, copy the **pooled** connection string — this is
   `DATABASE_URL`.

## 2. Cloudflare R2 (object storage)

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

## 3. GitHub Actions → GHCR

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

## 4. Railway project + backend service

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
   loops with an `npm error No workspaces found` error if left in place.
6. Settings → Deploy → **Pre-Deploy Command**: set it to `npx medusa
   db:migrate`. This runs once per deploy, between build and start, and
   handles both schema migrations and the data-seeding "migration scripts"
   under `backend/src/migration-scripts/` (see note in §6 below on what those
   seed).

## 5. Environment variables

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

## 6. First deploy

1. Push to `main` (or manually run the GHA workflow) to get an image onto
   GHCR, then deploy the service in Railway (or Redeploy, if it already
   pulled an older tag). **Railway does not currently auto-redeploy when a new
   image lands on GHCR** — after each backend change lands on `main` and the
   GHA build finishes, trigger a redeploy manually from the Railway dashboard.
   (Automating this trigger from the GHA workflow is a known gap, not yet
   set up.)
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

## 7. Verify

- `curl https://<backend-domain>/health` → `200`
- Log into `https://<backend-domain>/app` with the admin user from step 6.5.
- Create a publishable API key (Settings → Publishable API Keys) — the frontend
  will need this.
- Upload a product image via the admin to confirm R2 is wired correctly
  end-to-end.
