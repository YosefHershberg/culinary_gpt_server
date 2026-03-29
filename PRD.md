# CulinaryGPT Server - Product Requirements Document

## 1. Product Overview

CulinaryGPT is an AI-powered recipe generation platform. Users manage their kitchen inventory (ingredients and equipment), and the system generates personalized recipes and cocktails using Google Gemini AI, constrained to the user's available ingredients and tools. Generated dishes include AI-created images and are saved to the user's recipe collection.

**Tech Stack:** Node.js 22, Express, TypeScript, PostgreSQL (Prisma v7), Google Gemini AI, GetImg.ai, Supabase (Auth + Storage), Stripe Payments

---

## 2. Architecture

### 2.1 Layered Architecture

```
Client Request
  → Express Middleware (Morgan, Helmet, CORS, Rate Limiter)
    → Webhook routes (bypass auth, verify signatures)
      → Body Parser
        → Auth Middleware (Supabase JWT verification, attaches req.user)
          → Zod Validation Middleware
            → Controller (HTTP handling)
              → Service (business logic, AI orchestration)
                → Data Access Layer (Prisma queries)
                  → PostgreSQL
```

### 2.2 Directory Structure

```
src/
├── index.ts                    # Server entry point (PORT 5000)
├── app.ts                      # Express app config & middleware pipeline
├── middlewares.ts              # Auth (Supabase JWT), validation, error handling
├── api/
│   ├── controllers/            # HTTP request handlers
│   ├── services/               # Business logic (AI orchestration, CRUD)
│   ├── data-access/            # Prisma query layer (*.da.ts)
│   ├── routes/                 # Express route definitions
│   ├── schemas/                # Zod validation schemas
│   └── webhooks/               # Clerk & Stripe webhook handlers
├── config/                     # Prisma, Supabase, Stripe, Gemini, logger, rate limiter
├── utils/
│   ├── env.ts                  # Environment variable validation (Zod)
│   ├── swagger.ts              # Swagger/OpenAPI setup
│   └── prompts&schemas/        # AI prompt templates & Gemini response schemas
├── types/                      # TypeScript type definitions
└── lib/
    ├── HttpError.ts            # Custom HTTP error class
    └── data/                   # Static data (kitchen utils defaults)
prisma/
└── schema.prisma               # PostgreSQL schema (Prisma)
```

### 2.3 Middleware Pipeline (order of execution)

1. `morgan('dev')` — HTTP request logging
2. `helmet()` — Security headers
3. Swagger UI setup (`/docs`)
4. Trust proxy (1)
5. CORS (restricted in production to `CORS_ORIGIN`, open in dev)
6. Rate limiter (500 requests per 5-minute window per IP)
7. Webhook routes `/api/webhooks` (no auth, signature verification enforced)
8. `express.json()` — Body parsing
9. `authMiddleware` — Supabase JWT verification, attaches `req.user`
10. API routes `/api/*`
11. Health check `/health`
12. `notFound` handler (404)
13. `errorHandler` (catches HttpError or returns 500)

### 2.4 External Service Integrations

| Service | Purpose | Integration |
|---|---|---|
| Google Gemini (`@google/genai`) | Recipe/cocktail generation, ingredient detection from images | SDK, structured JSON output |
| GetImg.ai | AI food & cocktail image generation | REST API via Axios |
| Supabase Auth | User authentication (JWT verification) | Supabase JS SDK |
| Supabase Storage | Persistent image storage | Supabase JS SDK |
| Stripe | Subscription payments | Webhooks for checkout & cancellation |
| Google Cloud Vision | Image-based ingredient detection | Service-level integration |

---

## 3. Authentication & Authorization

- **Method:** Supabase Auth JWT tokens via `Authorization: Bearer <token>` header
- **Middleware:** `authMiddleware` calls `supabaseAdmin.auth.getUser(token)` and attaches `req.user` (Supabase `User` object)
- **Scope:** All `/api/*` routes require authentication
- **Exceptions:** `/health`, `/docs`, `/api/webhooks/*` bypass auth
- **Webhook security:** Stripe uses `stripe.webhooks.constructEvent()`; Clerk uses Svix signature verification

---

## 4. Data Models

Defined in `prisma/schema.prisma`. All IDs are UUIDs.

### 4.1 User

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key — sourced from Supabase Auth user ID |
| `email` | String | Unique |
| `firstName` | String | |
| `lastName` | String | |
| `isSubscribed` | Boolean | Default: false |
| `stripeCustomerId` | String? | Set on Stripe checkout |
| `stripeSubscriptionId` | String? | Set on Stripe checkout |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto-updated |

### 4.2 Recipe

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Auto-generated |
| `title` | String | |
| `description` | String | |
| `ingredients` | Json | Array of ingredient objects |
| `steps` | Json | Array of step objects |
| `time` | String | Total duration |
| `level` | String | 'easy', 'medium', 'hard' |
| `type` | String | 'recipe' or 'cocktail' |
| `recipeId` | String | UUID used for storage deletion tracking |
| `imageUrl` | String | Supabase Storage public URL |
| `userId` | UUID | FK → User (cascade delete) |
| `createdAt` | DateTime | Auto |

### 4.3 Ingredient (Global Catalog)

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `name` | String | |
| `category` | String[] | Enum: common, dairy, vegetables, spices, carbs, meat, spirits, liqueurs, bitters, mixers, syrups, fruits, herbs |
| `popularity` | Int | For sorting |
| `type` | String[] | 'food' or 'drink' |

### 4.4 UserIngredient

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `userId` | UUID | FK → User (cascade delete) |
| `ingredientId` | String | Reference to global Ingredient |
| `name` | String | Denormalized |
| `type` | String[] | 'food' or 'drink' |
| — | — | Unique constraint: (userId, ingredientId) |

### 4.5 KitchenUtils

| Field | Default |
|---|---|
| `stoveTop` | true |
| `oven` | true |
| `microwave` | true |
| `blender` | true |
| `airFryer` | false |
| `foodProcessor` | false |
| `slowCooker` | false |
| `bbq` | false |
| `grill` | false |

One record per user. FK → User (cascade delete), unique on `userId`.

---

## 5. API Reference

All `/api/*` routes require Supabase JWT authentication unless noted.

### 5.1 Recipe Endpoints (`/api/user/recipes`)

#### `POST /api/user/recipes/create` — Generate Recipe (SSE)

**Request body:**
```typescript
{
  mealSelected: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert',
  selectedTime: number,   // 5–120 minutes
  prompt: string,         // max 100 chars
  numOfPeople: number     // 1–99
}
```

**SSE events:**

| Event | Payload |
|---|---|
| `title` | `{ title: string }` |
| `recipe` | Full recipe object with `image_url` |
| `image` | `{ image_url: string }` (base64) |
| `error` | `{ message: string }` |

**Business logic:**
1. Fetch user's food ingredients + kitchen utils in parallel
2. Validate minimum 4 ingredients
3. Generate title via Gemini
4. Generate recipe (Gemini) + image (GetImg.ai) in parallel
5. Compress image to ~30KB base64
6. Stream events to client

#### `POST /api/user/recipes/create-cocktail` — Generate Cocktail (SSE)

**Request body:** `{ prompt: string }`

Same SSE event pattern. Uses drink-type ingredients only, max 5 in final cocktail, prioritizes classic cocktail names.

#### `GET /api/user/recipes` — List Recipes (Paginated)

**Query params:**
```typescript
{
  page: number,
  limit: number,
  query?: string,
  filter: 'recipes' | 'cocktails' | 'all',
  sort: 'newest' | 'oldest' | 'a-z' | 'z-a'
}
```

#### `POST /api/user/recipes` — Save Recipe

**Business logic:** Decodes base64 image, uploads to Supabase Storage, stores public URL in DB.

#### `GET /api/user/recipes/:id` — Get Recipe by ID

#### `DELETE /api/user/recipes/:id` — Delete Recipe

Deletes from DB + Supabase Storage in parallel.

---

### 5.2 Global Ingredient Endpoints (`/api/ingredients`)

#### `GET /api/ingredients/suggestions/:category`

**Path param:** `category` — one of: common, dairy, vegetables, spices, carbs, meat, spirits, liqueurs, bitters, mixers, syrups, fruits, herbs

#### `GET /api/ingredients/search`

**Query params:** `{ query: string, type: 'food' | 'drink' }`

#### `POST /api/ingredients/image-detect`

**Body:** `{ imageUrl: string }` (base64)

**Business logic:** Send to Gemini Vision → match labels against global catalog → return matched `Ingredient[]`.

---

### 5.3 User Ingredient Endpoints (`/api/user/ingredients`)

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/user/ingredients` | Get pantry |
| POST | `/api/user/ingredients` | Add single ingredient |
| POST | `/api/user/ingredients/multiple` | Bulk add |
| DELETE | `/api/user/ingredients/:id` | Remove ingredient |
| DELETE | `/api/user/ingredients/all` | Clear pantry |

---

### 5.4 Kitchen Utils Endpoints (`/api/user/kitchen-utils`)

#### `GET /api/user/kitchen-utils` — Get Equipment State

**Response:** Object with 9 boolean fields.

#### `PATCH /api/user/kitchen-utils` — Toggle Equipment

**Body:**
```typescript
{
  name: 'Stove Top' | 'Oven' | 'Microwave' | 'Air Fryer' | 'Blender' |
        'Food Processor' | 'Slow Cooker' | 'BBQ' | 'Grill'
}
```

---

### 5.5 Subscription Endpoints (`/api/user/subscriptions`)

#### `GET /api/user/subscriptions/isSubscribed`

**Response:** `{ subscriptionActive: boolean }`

---

### 5.6 Webhook Endpoints (`/api/webhooks`)

No authentication required. Signature verification enforced.

#### `POST /api/webhooks/clerk` — Clerk User Events (Svix signature)

| Event | Action |
|---|---|
| `user.created` | Create User record + initialize KitchenUtils |
| `user.deleted` | Delete user + cascade all data + Supabase Storage images |
| `user.updated` | Sync firstName, lastName, email |

#### `POST /api/webhooks/stripe` — Stripe Payment Events

| Event | Action |
|---|---|
| `checkout.session.completed` | Set `isSubscribed=true`, store Stripe IDs |
| `customer.subscription.deleted` | Set `isSubscribed=false`, clear Stripe IDs |

---

### 5.7 Utility Endpoints

| Route | Auth | Response |
|---|---|---|
| `GET /health` | None | `{ status: 'ok2' }` |
| `GET /docs` | None | Swagger UI |

---

## 6. Core Features

### 6.1 AI Recipe Generation

- User selects meal type, time constraint, serving size, optional text prompt
- System fetches food ingredients + kitchen equipment
- Minimum 4 ingredients required
- Gemini generates title → then recipe content (Gemini) + image (GetImg.ai) in parallel
- Image compressed to ~30KB, streamed as base64
- Full result streamed via SSE

### 6.2 AI Cocktail Generation

- User provides optional text prompt
- System fetches drink-type ingredients (min 4 required)
- Max 5 ingredients in final recipe; prioritizes classic cocktail names
- Same SSE streaming pattern

### 6.3 Ingredient Management

- Global catalog organized by category (seeded in DB)
- Users build a personal pantry from the catalog
- Search by name + type filter (food/drink)
- Image-based detection: upload photo → Gemini Vision → match against catalog
- Bulk add/remove operations

### 6.4 Kitchen Equipment Management

- 9 appliances with boolean availability
- Toggle individual items; affects AI recipe generation (only uses available tools)
- Initialized with sensible defaults on user creation (via Clerk webhook)

### 6.5 Recipe Collection

- Save AI-generated recipes with images
- Paginated browsing with filter, sort, and text search
- Images stored persistently in Supabase Storage
- Delete removes both DB record and storage image

### 6.6 Subscription Management

- Stripe-powered subscription billing
- Webhook-driven activation (`checkout.session.completed`) and cancellation (`customer.subscription.deleted`)
- Status checked via `GET /api/user/subscriptions/isSubscribed`

---

## 7. Validation

All routes use Zod schemas with the `validate()` middleware:

```typescript
router.post('/create', validate(createRecipeSchema), controller);
```

Validates `{ body, query, params }` together. Error response:

```json
{ "error": "Invalid data", "details": [{ "message": "field is Invalid" }] }
```

---

## 8. Error Handling

- **`HttpError` class:** Custom error with `statusCode` and `message`
- **Error middleware:** Returns appropriate status code; hides stack traces in production
- **Status codes:** 400 (validation), 401 (auth), 404 (not found), 500 (server)
- **AI service errors:** Logged; streamed as `error` SSE event to client

---

## 9. Streaming (SSE)

```
Client POST request
  → Server: Content-Type: text/event-stream
  → event: title   → { title: "..." }
  → event: recipe  → { recipe: {...}, image_url: "..." }
  → event: image   → { image_url: "base64..." }
  → event: error   → { message: "..." }  (on failure)
```

---

## 10. Testing

- **Framework:** Jest with ts-jest
- **HTTP:** Supertest for endpoint assertions
- **Test files:** `__tests__/` directories alongside source

---

## 11. Deployment

### Docker

- Base image: `node:22-alpine`
- Build step: `npx prisma generate` (generated client is gitignored)
- Entry: `npm start`

### Railway (Production)

Deployed on Railway. Env vars set in Railway dashboard (see `.env.example`).

### Environment Variables

All validated at startup via Zod. Server fails fast on missing variables.

| Variable | Purpose |
|---|---|
| `PORT` | Server port |
| `DATABASE_URL` | PostgreSQL connection pooler URL (pgbouncer) |
| `DIRECT_URL` | PostgreSQL direct URL (Prisma migrations only) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (bypasses RLS) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GETIMGAI_API_KEY` | GetImg.ai API key |
| `CORS_ORIGIN` | Allowed CORS origin URL |
| `STRIPE_SECRET_KEY` | Stripe API secret |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

---

## 12. Logging

- **Library:** Winston
- **Transports:** `logs/error.log`, `logs/info.log`, `logs/warning.log`, console (dev only)
- **Format:** JSON (files), colorized (console)
- **HTTP logging:** Morgan (`dev` format)

---

## 13. Known TODOs & Technical Debt

1. **User deletion atomicity:** Cascading deletes (user, recipes, ingredients, kitchen utils, storage images) lack a transaction — partial failures possible
2. **Storage batch deletes:** Recipe image deletions during user removal are individual operations; should be batched
3. **Subscription error handling:** `getUserBySubscriptionIdDB` has an unresolved error handling issue
4. **Stripe subscription deletion:** `customer.subscription.deleted` event handler not fully tested
