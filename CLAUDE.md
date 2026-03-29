# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # nodemon + ts-node (watch mode)
npm start            # ts-node src/index.ts
npm run build        # prisma generate + tsc → dist/
npm run start:dist   # node dist/src/index.js
npm test             # Jest
npm run test:watch   # Jest watch mode
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint with auto-fix
npm run docs         # generate JSDoc HTML
```

## Architecture

**Layered/Clean Architecture:**
```
Controller → Service → Data Access (*.da.ts) → PostgreSQL (Prisma)
```

Each request flows through:
1. Morgan + Helmet + CORS + Rate limiter
2. Webhook routes (`/api/webhooks/*`) — bypass auth, verify signatures
3. `express.json()` body parser
4. `authMiddleware` — Supabase JWT verification, attaches `req.user`
5. Zod `validate()` middleware (per route)
6. Controller → Service → Data Access

**Key Directories:**
- `src/api/controllers/` — HTTP handlers (OpenAPI JSDoc annotations)
- `src/api/services/` — Business logic & AI orchestration
- `src/api/data-access/` — Prisma queries (`*.da.ts`)
- `src/api/routes/` — Express route definitions
- `src/api/schemas/` — Zod validation schemas
- `src/api/webhooks/` — Clerk & Stripe webhook handlers
- `src/config/` — External clients (Prisma, Supabase, Stripe, Gemini, logger, rate limiter)
- `src/utils/prompts&schemas/` — AI prompt templates & Gemini response schemas

## Database

**PostgreSQL via Prisma v7 with PrismaPg driver adapter.**

Schema in `prisma/schema.prisma`. Generated client outputs to `src/generated/prisma/` (gitignored — regenerated at build time via `npx prisma generate`).

Models: `User`, `Recipe`, `Ingredient`, `UserIngredient`, `KitchenUtils`

Prisma config in `prisma.config.ts` — uses `DATABASE_URL` (pooler) for runtime, `DIRECT_URL` (direct) for migrations.

```bash
npm run db:migrate    # run migrations
npm run db:push       # push schema without migration
npm run db:seed       # seed data
```

## Authentication

**Supabase Auth** — JWT Bearer tokens.

```typescript
// middlewares.ts — authMiddleware
const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
req.user = user;  // attaches Supabase User object
```

All `/api/*` routes require auth. Exceptions: `/health`, `/docs`, `/api/webhooks/*`.

Controllers access the user via `req.user.id` (Supabase UUID).

## Validation Pattern

All routes use Zod schemas with `validate()` middleware:

```typescript
router.post('/create', validate(createRecipeSchema), createRecipe);
```

Schemas in `src/api/schemas/` — validates `{ body, query, params }` together.

**Error response:**
```json
{ "error": "Invalid data", "details": [{ "message": "field is Invalid" }] }
```

## Environment Variables

Validated at startup via Zod in `src/utils/env.ts`. Server fails fast if any are missing.

Required: `PORT`, `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GETIMGAI_API_KEY`, `CORS_ORIGIN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

Not validated by env.ts (read directly from `process.env`): `DIRECT_URL` (Prisma migrations), Clerk webhook secret

## Streaming (SSE)

Recipe/cocktail creation streams events to the client:

```
event: title   → { title: string }
event: recipe  → { recipe: {...}, image_url: string }
event: image   → { image_url: string }  (base64)
event: error   → { message: string }
```

## Webhooks

- **Clerk** (`/api/webhooks/clerk`) — user lifecycle: create user + kitchen utils on `user.created`, cascade delete on `user.deleted`, sync on `user.updated`
- **Stripe** (`/api/webhooks/stripe`) — subscription: set `isSubscribed=true` on `checkout.session.completed`, false on `customer.subscription.deleted`

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/user/recipes/create` | POST | Generate recipe (SSE) |
| `/api/user/recipes/create-cocktail` | POST | Generate cocktail (SSE) |
| `/api/user/recipes` | GET | List recipes (paginated) |
| `/api/user/recipes` | POST | Save recipe |
| `/api/user/recipes/:id` | GET/DELETE | Get/delete recipe |
| `/api/user/ingredients` | GET/POST/DELETE | Pantry CRUD |
| `/api/user/ingredients/multiple` | POST | Bulk add |
| `/api/user/ingredients/all` | DELETE | Clear pantry |
| `/api/user/kitchen-utils` | GET/PATCH | Get/toggle equipment |
| `/api/user/subscriptions/isSubscribed` | GET | Subscription status |
| `/api/ingredients/suggestions/:category` | GET | Ingredient catalog |
| `/api/ingredients/search` | GET | Search ingredients |
| `/api/ingredients/image-detect` | POST | AI image detection |
| `/health` | GET | Health check (no auth) |
| `/docs` | GET | Swagger UI (no auth) |

## Testing

Jest with ts-jest. Tests use `supertest` for HTTP assertions. Test files are in `__tests__/` directories next to source files.

```bash
npm test
npm run test:watch
```

## Docker

`node:22-alpine` base image. Build runs `npx prisma generate` (required since `src/generated/prisma/` is gitignored).

```dockerfile
FROM node:22-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "start"]
```

## External Services

| Service | Purpose | Config |
|---|---|---|
| Google Gemini | Recipe/cocktail generation, ingredient detection | `src/config/gemini.ts` |
| GetImg.ai | AI image generation (REST) | Direct HTTP via Axios |
| Supabase Storage | Image storage | `src/config/supabase.ts` |
| Supabase Auth | JWT verification | `src/config/supabase.ts` |
| Stripe | Subscription payments | `src/config/stripe.ts` |
| Google Cloud Vision | Image ingredient detection | Service-level integration |
