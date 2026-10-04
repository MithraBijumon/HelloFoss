# Deploying to Coolify

This app is a Next.js site backed by Postgres (via Prisma) and a Google Apps
Script web app for email (see `scripts/gas-mailer.gs`). It ships with a
`Dockerfile` that Coolify's Dockerfile buildpack picks up automatically.

## 1. Generate the first migration (do this locally, once)

`prisma/migrations/` isn't committed yet — `prisma migrate deploy` (which the
container runs on every start) only *applies* migrations that already exist,
it never creates them. If you deploy before this step, the production
database will come up with no tables at all.

Against your local dev Postgres (`docker compose -f docker-compose.dev.yml up -d`):

```
npx prisma migrate dev --name init
```

Commit the resulting `prisma/migrations/` folder.

## 2. Provision Postgres in Coolify

- New Resource → Database → PostgreSQL → Deploy.
- Once it's running, copy the **internal** connection string (not the public
  one) — the app and database will talk to each other over Coolify's
  internal network.

## 3. Create the application

- New Resource → Application → point it at this repo/branch.
- Build Pack: **Dockerfile** (Coolify should detect it automatically since
  there's a `Dockerfile` at the repo root).
- Port: `3000` (matches the Dockerfile's `EXPOSE`).

## 4. Environment variables

Set these in the application's Coolify settings (see `.env.example` for the
full list with descriptions):

| Variable | Value |
|---|---|
| `DATABASE_URL` | The internal Postgres connection string from step 2 |
| `SESSION_SECRET` | A **fresh** secret — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Don't reuse the dev one. |
| `ADMIN_EMAILS` | Comma-separated emails that should get ADMIN access |
| `GAS_MAIL_WEBHOOK_URL` | **Required in production** — see warning below |
| `GAS_MAIL_SECRET` | **Required in production** — see warning below |

**`GAS_MAIL_WEBHOOK_URL`/`GAS_MAIL_SECRET` are not optional in production.**
When they're unset, [lib/email.ts](lib/email.ts) skips sending mail entirely
and instead returns the OTP code directly in the API response (that's the
dev convenience the login modal shows as "Dev mode — your code is...").
Deploying without them means anyone watching network traffic could read
anyone else's login code. Follow the setup steps at the top of
`scripts/gas-mailer.gs` to deploy the mailer and get both values before going
live. Note its quota is tied to whichever Google account you deploy it
under — 100 emails/day on a personal gmail.com account, 1,500/day on a
Google Workspace account.

## 5. Domain & TLS

The site's public URL (used for SEO/link-preview tags) is set in
`data/site.ts` — currently `https://hellofoss.tech-iitb.org`.

Add your domain in the application's Coolify settings and enable HTTPS —
Coolify provisions a Let's Encrypt certificate automatically via Traefik.

## 6. Deploy

Trigger a deploy. The container:

1. Runs `npx prisma migrate deploy` — applies any migrations in
   `prisma/migrations/` that haven't run yet (no-op if the DB is already
   current).
2. Runs `npm run start` (`next start`), listening on port 3000.

## Future schema changes

Whenever you change `prisma/schema.prisma`, run `prisma migrate dev --name
<something>` locally against your dev DB, commit the new migration folder,
and push. The next deploy applies it automatically — no manual DB access
needed.
