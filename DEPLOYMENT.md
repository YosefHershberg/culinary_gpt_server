# Deployment — CulinaryGPT Server

The server is deployed to **Railway**. The client (a separate repo) is deployed to **Vercel** — see that repo's `DEPLOYMENT.md`.

## Platform: Railway

- **Trigger:** Railway's GitHub integration **auto-deploys on push to `main`**. Merging a PR into `main` ships to production.
- **Build:** Railway builds from the repo `Dockerfile` (no `railway.json`/`nixpacks.toml` present, so the Dockerfile is auto-detected). It runs `npm ci`, `npx prisma generate`, and starts via `npm start`, as the non-root `node` user.
- **Logs:** the app logs to **stdout/stderr** (winston Console transport — no log files). Railway captures stdout; view it in the Railway dashboard or via the Railway skill.
- **Runtime URL:** `https://culinarygptserver-production.up.railway.app`.

### Environment variables

Set these in the **Railway service → Variables** (validated at startup by `src/utils/env.ts`; the server fails fast if any are missing):

`PORT`, `DATABASE_URL` (pooled), `DIRECT_URL` (direct, for migrations), `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GETIMGAI_API_KEY`, `CORS_ORIGIN`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NODE_ENV=production`.

> `CORS_ORIGIN` must be the deployed client origin (the Vercel URL). In non-production
> the server reflects any origin, so production correctness depends on this being set.

## CI/CD

GitHub Actions: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).

- **Runs on:** push to `main`.
- **What it does:** checks out, `npm ci`, writes `.env` from the `PROD_ENV_FILE` GitHub secret, `npm run build`, `npm test` (Jest, Node 20.x).
- **What it does NOT do:** deploy. Deployment is Railway's responsibility (its GitHub integration), so the workflow is build-and-test only. The old AWS ECS/EC2 deploy steps were removed during the Railway migration.

```
push to main
  ├─ GitHub Actions: npm ci → build → test   (gate)
  └─ Railway: docker build → deploy           (ship)
```

## When to use the Railway skill / connector

This repo has a **Railway skill** (`railway:use-railway`) and Railway MCP tools available. Reach for them — instead of guessing or hand-rolling `railway` CLI calls — whenever a task involves the live deployment, for example:

- **Deploys & status:** trigger a deploy, check whether the latest deploy succeeded, roll back, inspect deployment history.
- **Logs & debugging:** fetch build logs or runtime logs to diagnose a crash or a failed deploy (a `502`/boot loop usually means a missing/invalid env var — see `env.ts`).
- **Environment & config:** read or set service variables, generate a domain, view the service's build/start configuration.
- **Metrics & health:** check HTTP request/error-rate/response-time and resource metrics.
- **Provisioning:** create services, databases, volumes, or object-storage buckets; link environments.
- **Docs:** query Railway's own docs for platform specifics.

Rule of thumb: if the question is about *the running server on Railway* (not the code in this repo), use the Railway skill/MCP rather than answering from memory.
