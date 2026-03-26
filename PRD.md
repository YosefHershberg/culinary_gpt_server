# CulinaryGPT Server - Product Requirements Document

## 1. Product Overview

CulinaryGPT is an AI-powered recipe generation platform. Users manage their kitchen inventory (ingredients and equipment), and the system generates personalized recipes and cocktails using Google Gemini AI, constrained to the user's available ingredients and tools. Generated dishes include AI-created images and are saved to the user's recipe collection.

**Tech Stack:** Node.js, Express, TypeScript, MongoDB (Mongoose), Google Gemini AI, Supabase Storage, Clerk Auth, Stripe Payments, GetImg.ai

---

## 2. Architecture

### 2.1 Layered Architecture

```
Client Request
  --> Express Middleware (CORS, Helmet, Rate Limiter, Morgan)
    --> Route + Zod Validation Middleware
      --> Auth Middleware (Clerk JWT verification)
        --> Controller (HTTP handling)
          --> Service (business logic, AI orchestration)
            --> Data Access Layer (Mongoose queries)
              --> MongoDB
```

### 2.2 Directory Structure

```
src/
├── index.ts                     # Server entry point (listens on PORT)
├── app.ts                       # Express app config & middleware pipeline
├── middlewares.ts                # Auth, validation, error handling middleware
├── api/
│   ├── controllers/             # HTTP request handlers (6 controllers)
│   ├── services/                # Business logic (11 services)
│   ├── data-access/             # MongoDB query layer (*.da.ts files)
│   ├── models/                  # Mongoose schemas (5 models)
│   ├── routes/                  # Express route definitions (6 route files)
│   ├── schemas/                 # Zod validation schemas
│   └── webhooks/                # Clerk & Stripe webhook handlers
├── config/                      # DB, logger, rate limiter, Supabase, Stripe, Gemini
├── utils/
│   ├── env.ts                   # Environment variable validation (Zod)
│   ├── helperFunctions.ts       # Utility functions
│   ├── swagger.ts               # Swagger/OpenAPI setup
│   └── prompts&schemas/         # AI prompt templates & response schemas
├── types/                       # TypeScript type definitions
└── lib/
    ├── HttpError.ts             # Custom HTTP error class
    ├── verifyCvixHeaders.ts     # Svix webhook signature verification
    ├── data/                    # Static data (kitchen utils defaults)
    └── mock/                    # Test fixtures
```

### 2.3 Middleware Pipeline (order of execution)

1. `morgan('dev')` - HTTP request logging
2. `helmet()` - Security headers
3. Swagger UI setup (`/docs`)
4. Trust proxy (1)
5. CORS (restricted in production, open in dev)
6. Rate limiter (500 requests per 5-minute window per IP)
7. Webhook routes (bypass auth, verify signatures)
8. `express.json()` - Body parsing
9. `authMiddleware` - Clerk JWT verification, attaches `req.userId`
10. API routes
11. Health check (`/health`)
12. `notFound` handler (404)
13. `errorHandler` (catches HttpError or returns 500)

### 2.4 External Service Integrations

| Service | Purpose | Integration Method |
|---|---|---|
| Google Gemini (`@google/genai`) | Recipe/cocktail/title generation, image-based ingredient detection | SDK, structured JSON output with schema validation |
| GetImg.ai (Flux Schnell) | AI food & cocktail image generation | REST API via Axios |
| Supabase Storage | Persistent image storage | Supabase JS SDK |
| Clerk | User authentication | JWT verification, webhooks for user lifecycle |
| Stripe | Subscription payments | Webhooks for checkout & cancellation events |
| MongoDB | Primary database | Mongoose ODM |

---

## 3. Authentication & Authorization

- **Method:** Clerk JWT tokens via `Authorization: Bearer <token>` header
- **Middleware:** `authMiddleware` verifies token with `@clerk/express.verifyToken()` and attaches `req.userId`
- **Scope:** All `/api/*` routes require authentication
- **Exceptions:** `/health`, `/docs`, `/api/webhooks/*` bypass auth
- **Webhook security:** Clerk uses Svix signature verification; Stripe uses `stripe.webhooks.constructEvent()`

---

## 4. Data Models

### 4.1 User

| Field | Type | Notes |
|---|---|---|
| first_name | String | Required, trimmed |
| last_name | String | Required, trimmed |
| clerkId | String | Required, from Clerk auth |
| email | String | Required, unique, lowercase |
| isSubscribed | Boolean | Default: false |
| stripeCustomerId | String | Optional, set on subscription |
| stripeSubscriptionId | String | Optional, set on subscription |
| createdAt | Date | Immutable, auto |
| updatedAt | Date | Auto-updated via pre-save hook |

### 4.2 Recipe (RecipeWithImage)

| Field | Type | Notes |
|---|---|---|
| recipe.title | String | Required, trimmed |
| recipe.description | String | Required, max 120 chars |
| recipe.ingredients | Array<{ ingredient: String }> | At least 1 |
| recipe.steps | Array<{ step: String, time: String }> | At least 1 |
| recipe.time | String | Total duration |
| recipe.level | Enum | 'easy', 'medium', 'hard' |
| recipe.type | Enum | 'recipe', 'cocktail' |
| recipe.id | String | UUID for deletion tracking |
| image_url | String | Supabase Storage public URL |
| userId | String | Reference to User |
| createdAt | Date | Auto, default now |

### 4.3 Ingredient (Global Catalog)

| Field | Type | Notes |
|---|---|---|
| name | String | Required, trimmed |
| category | Array\<String\> | Enum: common, dairy, vegetables, spices, carbs, meat, spirits, liqueurs, bitters, mixers, syrups, fruits, herbs |
| popularity | Number | Required, for sorting |
| type | Array\<String\> | Enum: 'food', 'drink' |

### 4.4 UserIngredient

| Field | Type | Notes |
|---|---|---|
| userId | String | Required |
| ingredientId | String | Reference to Ingredient._id |
| name | String | Denormalized from Ingredient |
| type | Array\<String\> | Enum: 'food', 'drink' |

**Serialization:** Custom `toJSON`/`toObject` transforms output to `{ id, name, type }` (strips userId, _id, ingredientId).

### 4.5 KitchenUtils

| Field | Type | Default |
|---|---|---|
| userId | String | Required |
| kitchenUtils."Stove Top" | Boolean | true |
| kitchenUtils."Oven" | Boolean | true |
| kitchenUtils."Microwave" | Boolean | true |
| kitchenUtils."Air Fryer" | Boolean | false |
| kitchenUtils."Blender" | Boolean | true |
| kitchenUtils."Food Processor" | Boolean | false |
| kitchenUtils."Slow Cooker" | Boolean | false |
| kitchenUtils."BBQ" | Boolean | false |
| kitchenUtils."Grill" | Boolean | false |

---

## 5. API Reference

All routes under `/api/*` require Clerk JWT authentication unless noted otherwise.

### 5.1 Recipe Endpoints (`/api/user/recipes`)

#### POST `/api/user/recipes/create` - Generate Recipe (SSE)

Generates an AI recipe using the user's ingredients and kitchen equipment. Returns a Server-Sent Events stream.

**Request Body:**
```typescript
{
  mealSelected: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert',
  selectedTime: number,   // 5-120 minutes
  prompt: string,         // max 100 chars, additional instructions
  numOfPeople: number     // 1-99 servings
}
```

**SSE Events:**
| Event | Payload | Description |
|---|---|---|
| `title` | `{ title: string }` | Generated recipe title |
| `recipe` | `RecipeWithImage` | Full recipe object |
| `image` | `{ image_url: string }` | Base64 AI-generated image |
| `error` | `{ message: string }` | Error during generation |

**Business Logic:**
1. Fetch user's food ingredients and kitchen utils in parallel
2. Validate minimum 4 ingredients
3. Generate title via Gemini
4. Generate recipe content (Gemini) and image (GetImg.ai) in parallel
5. Compress image to ~30KB base64
6. Stream events to client

#### POST `/api/user/recipes/create-cocktail` - Generate Cocktail (SSE)

**Request Body:**
```typescript
{
  prompt: string   // cocktail instructions/preferences
}
```

**SSE Events:** Same as recipe creation.

**Business Logic:**
- Uses drink-type ingredients only
- Max 5 ingredients in final cocktail
- Prioritizes classic cocktail names (Margarita, Mojito, etc.)

#### GET `/api/user/recipes` - List Recipes (Paginated)

**Query Parameters:**
```typescript
{
  page: number,                              // required
  limit: number,                             // required
  query?: string,                            // optional search text
  filter: 'recipes' | 'cocktails' | 'all',  // required
  sort: 'newest' | 'oldest' | 'a-z' | 'z-a' // required
}
```

**Response:** `RecipeWithImage[]`

#### POST `/api/user/recipes` - Save Recipe

**Request Body:**
```typescript
{
  recipe: {
    title: string,        // 3-100 chars
    description: string,  // max 500 chars
    ingredients: [{ ingredient: string }],  // min 1, each min 2 chars
    steps: [{ step: string, time: string }], // min 1
    time: string,
    level: string,
    type: 'recipe' | 'cocktail',
    id: string            // UUID
  },
  image_url: string       // base64 data URL
}
```

**Response:** `RecipeWithImage`

**Business Logic:** Decodes base64 image, uploads to Supabase Storage, stores public URL in MongoDB.

#### GET `/api/user/recipes/:id` - Get Recipe by ID

**Response:** `RecipeWithImage`

#### DELETE `/api/user/recipes/:id` - Delete Recipe

**Response:** `{ message: string }`

**Business Logic:** Deletes recipe from MongoDB and image from Supabase Storage in parallel.

---

### 5.2 Global Ingredient Endpoints (`/api/ingredients`)

#### GET `/api/ingredients/suggestions/:category` - Get Suggestions

**Path Parameters:**
```typescript
{
  category: 'common' | 'vegetables' | 'dairy' | 'spices' | 'carbs' | 'meat' |
            'spirits' | 'liqueurs' | 'bitters' | 'mixers' | 'syrups' | 'fruits' | 'herbs'
}
```

**Response:** `Ingredient[]`
```typescript
[{
  category: string[],
  name: string,
  id: string,
  popularity?: number,
  type: ('food' | 'drink')[]
}]
```

#### GET `/api/ingredients/search` - Search Ingredients

**Query Parameters:**
```typescript
{
  query: string,                // search text
  type: 'food' | 'drink'       // filter by type
}
```

**Response:** `Ingredient[]`

#### POST `/api/ingredients/image-detect` - Detect Ingredients from Image

**Request Body:**
```typescript
{
  imageUrl: string   // base64 image
}
```

**Response:** `Ingredient[]` (only ingredients that exist in the global catalog)

**Business Logic:**
1. Send image to Gemini Vision for label detection
2. Query MongoDB for matching ingredient names
3. Return only catalog-matched ingredients

---

### 5.3 User Ingredient Endpoints (`/api/user/ingredients`)

#### GET `/api/user/ingredients` - Get User's Pantry

**Response:** `UserIngredientResponse[]`
```typescript
[{ name: string, id: string, type: ('food' | 'drink')[] }]
```

#### POST `/api/user/ingredients` - Add Single Ingredient

**Request Body:** `Ingredient` (full ingredient object)

**Response:** `UserIngredientResponse`

#### POST `/api/user/ingredients/multiple` - Add Multiple Ingredients

**Request Body:** `Ingredient[]`

**Response:** `UserIngredientResponse[]`

#### DELETE `/api/user/ingredients/:id` - Remove Ingredient

**Response:** `{ message: string }`

#### DELETE `/api/user/ingredients/all` - Clear Pantry

**Response:** `{ message: string }`

---

### 5.4 Kitchen Utils Endpoints (`/api/user/kitchen-utils`)

#### GET `/api/user/kitchen-utils` - Get Equipment

**Response:** `KitchenUtils` (object with 9 boolean fields)

#### PATCH `/api/user/kitchen-utils` - Toggle Equipment

**Request Body:**
```typescript
{
  name: 'Stove Top' | 'Oven' | 'Microwave' | 'Air Fryer' | 'Blender' |
        'Food Processor' | 'Slow Cooker' | 'BBQ' | 'Grill'
}
```

**Response:** `KitchenUtils` (updated state)

---

### 5.5 Subscription Endpoints (`/api/user/subscriptions`)

#### GET `/api/user/subscriptions/isSubscribed` - Check Subscription

**Response:**
```typescript
{ subscriptionActive: boolean }
```

---

### 5.6 Webhook Endpoints (`/api/webhooks`)

No authentication required. Signature verification enforced.

#### POST `/api/webhooks/clerk` - Clerk User Events

**Signature:** Svix headers verification

| Event | Action |
|---|---|
| `user.created` | Create user in MongoDB + initialize kitchen utils |
| `user.deleted` | Delete user, all recipes, ingredients, kitchen utils, and Firebase images |
| `user.updated` | Update user first_name, last_name, email |

**Response:** `{ success: boolean, message: string }`

#### POST `/api/webhooks/stripe` - Stripe Payment Events

**Signature:** Stripe webhook secret verification

| Event | Action |
|---|---|
| `checkout.session.completed` | Set isSubscribed=true, store Stripe customer/subscription IDs |
| `customer.subscription.deleted` | Set isSubscribed=false, clear Stripe IDs |

**Response:** `{ received: true }`

---

### 5.7 Utility Endpoints

#### GET `/health` - Health Check (No Auth)

**Response:** `{ status: 'ok2' }`

#### GET `/docs` - Swagger UI (No Auth)

Interactive OpenAPI documentation.

---

## 6. Core Features

### 6.1 AI Recipe Generation

- Users select meal type, time constraint, serving size, and optional instructions
- System fetches user's food ingredients and available kitchen equipment
- Minimum 4 ingredients required
- Gemini generates a recipe title, then recipe content and image in parallel
- GetImg.ai generates a hyper-realistic food photograph
- Image compressed to ~30KB and streamed as base64
- Results streamed via SSE for real-time UX

### 6.2 AI Cocktail Generation

- Users provide a text prompt describing desired cocktail
- System fetches user's drink-type ingredients
- Minimum 4 drink ingredients required
- Max 5 ingredients in final cocktail recipe
- Prioritizes classic cocktail names when ingredients match
- Same SSE streaming pattern as recipes

### 6.3 Ingredient Management

- Global ingredient catalog organized by category
- Users build a personal pantry by selecting from the catalog
- Search ingredients by name with type filtering (food/drink)
- Image-based ingredient detection: upload a photo, AI identifies ingredients, matched against catalog
- Bulk add/remove operations

### 6.4 Kitchen Equipment Management

- 9 supported kitchen utilities with boolean availability
- Toggle individual items on/off
- Equipment constraints influence AI recipe generation (only uses available tools)
- Initialized with sensible defaults on user creation

### 6.5 Recipe Collection

- Save AI-generated recipes with images to personal collection
- Paginated browsing with filtering (recipes/cocktails/all) and sorting (date/alphabetical)
- Text search by recipe title
- Individual recipe view and deletion
- Images stored persistently in Supabase Storage

### 6.6 Subscription Management

- Stripe-powered subscription billing
- Checkout session flow via Stripe
- Subscription status tracked in user document
- Webhook-driven activation and cancellation

### 6.7 User Lifecycle

- Clerk-managed authentication (JWT)
- Webhook-driven user creation: creates MongoDB user + initializes kitchen utils
- Webhook-driven user deletion: cascading cleanup of all user data (recipes, ingredients, kitchen utils, storage images)
- Profile updates synced from Clerk via webhooks

---

## 7. Validation

All route validation uses Zod schemas with the `validate()` middleware.

**Pattern:**
```typescript
router.post('/create', validate(createRecipeSchema), controller);
```

**Validation targets:** `req.body`, `req.query`, `req.params`

**Error response on validation failure:**
```typescript
{
  error: 'Invalid data',
  details: ZodError[]   // detailed field-level errors
}
```

**Key Zod schemas:**
- `createRecipeSchema` - Recipe generation input
- `createCocktailSchema` - Cocktail generation input
- `getRecipesSchema` - Pagination, filtering, sorting params
- `addRecipeSchema` - Recipe save payload
- `ingredientSchema` - Ingredient object shape
- `addIngredientSchema` / `addMultipleIngredientsSchema` - User ingredient operations
- `toggleKitchenUtilsSchema` - Kitchen util toggle
- `ingredientSuggestionsSchema` - Category path param
- `searchIngredientsSchema` - Search query + type
- `imageIngredientDetectorSchema` - Image URL body
- `doSomethingByIdSchema` - Generic `:id` path param

---

## 8. Error Handling

- **HttpError class:** Custom error with `statusCode` and `message`
- **Error middleware:** Catches all errors, returns appropriate status code
- **Stack traces:** Hidden in production (`NODE_ENV === 'production'`)
- **Status codes used:** 400 (validation), 401 (auth), 404 (not found), 500 (server error)
- **AI service errors:** Logged but do not throw; return undefined/partial results, streamed as `error` SSE event

---

## 9. Streaming (SSE)

Recipe and cocktail creation use Server-Sent Events for real-time response delivery:

```
Client opens POST request
  --> Server sets headers: Content-Type: text/event-stream
  --> Server streams events as generation completes:
      event: title    --> { title: "..." }
      event: recipe   --> { recipe: {...}, image_url: "..." }
      event: image    --> { image_url: "base64..." }
      event: error    --> { message: "..." }  (on failure)
```

---

## 10. Testing

- **Framework:** Jest with ts-jest preset
- **HTTP testing:** Supertest for endpoint assertions
- **Database:** mongodb-memory-server for isolated in-memory MongoDB
- **Mocking:** External services (storage, data access, AI) mocked with `jest.mock()`
- **Test locations:** `__tests__/` directories alongside source files
- **Coverage:** Controller tests (3) and service tests (4)

**Commands:**
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

---

## 11. Deployment & CI/CD

### Docker

- Base image: `node:18-alpine`
- Exposes port 5000
- Entry: `npm start`

### CI/CD (GitHub Actions)

- **Trigger:** Push to `main` branch
- **Node version:** 20.x
- **Steps:** Install -> Build -> Test
- **Deployment:** Railway.app (production)

### Environment Variables

All validated at startup via Zod (`src/utils/env.ts`). Server fails fast on missing variables.

| Variable | Purpose |
|---|---|
| `PORT` | Server port |
| `NODE_ENV` | Environment (development/production) |
| `MONGODB_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GETIMGAI_API_KEY` | GetImg.ai API key |
| `CLERK_SECRET_KEY` | Clerk backend secret |
| `CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `WEBHOOK_SECRET` | Clerk webhook signing secret |
| `CORS_ORIGIN` | Allowed CORS origin URL |
| `STRIPE_SECRET_KEY` | Stripe API secret |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

---

## 12. Logging

- **Library:** Winston
- **Transports:**
  - `logs/error.log` - Error level only
  - `logs/info.log` - Info level
  - `logs/warning.log` - Warning level
  - Console (development only, colorized)
- **Format:** JSON (files), simple colorized (console)
- **Timestamp:** `YYYY-MM-DD HH:mm:ss`
- **HTTP logging:** Morgan (`dev` format)

---

## 13. Known TODOs & Technical Debt

1. **User deletion atomicity:** Cascading delete operations (user, recipes, ingredients, kitchen utils, storage images) lack a transaction - partial failures possible
2. **Storage batch deletes:** Recipe image deletions during user removal are individual operations; should be batched
3. **Subscription error handling:** `getUserBySubscriptionIdDB` has an unresolved error handling issue
4. **Type safety:** `toggleKitchenUtilDB` uses `@ts-expect-error` for dynamic property access on kitchen util names
5. **Stripe subscription deletion:** `customer.subscription.deleted` event handler noted as not fully tested
