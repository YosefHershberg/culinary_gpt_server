# CulinaryGPT - Server

## Description

Node.js/Express REST API that generates personalized recipes and cocktails using Google Gemini AI. Built with a layered clean architecture (Controller → Service → Data Access → PostgreSQL). Deployed on Railway via Docker.

## Tech Stack

- **Runtime:** Node.js 22, TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL via Prisma v7 (PrismaPg driver adapter)
- **Auth:** Supabase Auth (JWT verification)
- **AI:** Google Gemini (`@google/genai`), GetImg.ai (image generation), Google Cloud Vision (image detection)
- **Storage:** Supabase Storage
- **Payments:** Stripe (webhooks)
- **Validation:** Zod
- **Logging:** Winston + Morgan
- **Docs:** Swagger UI (`/docs`)

## Get Started

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev            # development (nodemon + ts-node)
npm start              # production (ts-node)
npm run start:dist     # run compiled output
```

## Commands

```bash
npm run dev          # nodemon + ts-node watch mode
npm start            # ts-node src/index.ts
npm run build        # prisma generate + tsc → dist/
npm run start:dist   # node dist/src/index.js
npm test             # Jest
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint with auto-fix
npm run docs         # generate JSDoc HTML
```

## Project Structure

```
src/
├── index.ts                    # Entry point
├── app.ts                      # Express setup & middleware pipeline
├── middlewares.ts              # Auth (Supabase JWT), validation, error handling
├── api/
│   ├── controllers/            # HTTP request handlers
│   ├── services/               # Business logic & AI orchestration
│   ├── data-access/            # Prisma queries (*.da.ts)
│   ├── routes/                 # Express route definitions
│   ├── schemas/                # Zod validation schemas
│   └── webhooks/               # Clerk & Stripe webhook handlers
├── config/                     # Prisma, Supabase, Stripe, Gemini, logger, rate limiter
├── utils/
│   ├── env.ts                  # Zod env validation (fails fast on startup)
│   ├── swagger.ts              # Swagger setup
│   └── prompts&schemas/        # AI prompt templates & response schemas
├── types/                      # TypeScript types
└── lib/
    ├── HttpError.ts            # Custom error class
    └── data/                   # Static data
prisma/
└── schema.prisma               # Database schema
```

## Environment Variables

See `.env.example`. All validated at startup via Zod — server fails fast if any are missing.

| Variable | Purpose |
|---|---|
| `PORT` | Server port |
| `DATABASE_URL` | PostgreSQL connection pooler URL |
| `DIRECT_URL` | PostgreSQL direct URL (for Prisma migrations) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin secret (bypasses RLS) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GETIMGAI_API_KEY` | GetImg.ai API key |
| `CORS_ORIGIN` | Allowed CORS origin |
| `STRIPE_SECRET_KEY` | Stripe API secret |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

## API

- `POST /api/user/recipes/create` — Generate recipe (SSE stream)
- `POST /api/user/recipes/create-cocktail` — Generate cocktail (SSE stream)
- `GET/POST/DELETE /api/user/recipes` — Recipe CRUD
- `GET/POST/DELETE /api/user/ingredients` — User pantry management
- `GET/PATCH /api/user/kitchen-utils` — Equipment toggles
- `GET /api/user/subscriptions/isSubscribed` — Subscription check
- `GET /api/ingredients/suggestions/:category` — Ingredient catalog
- `GET /api/ingredients/search` — Search ingredients
- `POST /api/ingredients/image-detect` — AI ingredient detection
- `POST /api/webhooks/clerk` — User lifecycle events
- `POST /api/webhooks/stripe` — Payment events
- `GET /health` — Health check (no auth)
- `GET /docs` — Swagger UI (no auth)
