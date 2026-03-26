# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CulinaryGPT Server is a Node.js/Express REST API that generates recipes using Google Gemini AI. It uses MongoDB with Mongoose, Supabase for image storage, Clerk for authentication, and Stripe for payments.

## Commands

```bash
npm run dev          # Start development server (nodemon + ts-node)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled dist/index.js
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint with auto-fix
npm run typecheck    # Type check without emitting
npm run docs         # Generate JSDoc HTML
```

## Architecture

**Layered/Clean Architecture Pattern:**
```
Controllers → Services → Data Access → MongoDB
```

Each request flows through:
1. Route handler with Zod validation middleware
2. Controller (handles HTTP, calls services)
3. Service (business logic, AI integration)
4. Data Access layer (Mongoose queries)

**Key Directories:**
- `src/api/controllers/` - Request handlers with OpenAPI JSDoc annotations
- `src/api/services/` - Business logic (recipes, AI generation, images)
- `src/api/data-access/` - Database operations (`*.da.ts` files)
- `src/api/models/` - Mongoose schemas
- `src/api/routes/` - Express route definitions
- `src/api/schemas/` - Zod validation schemas
- `src/api/webhooks/` - Clerk and Stripe webhook handlers
- `src/config/` - Database, logger, rate limiting, external clients
- `src/utils/prompts&schemas/` - AI prompts and response schemas

## API Routes

- `/api/user/recipes` - Recipe CRUD and AI creation
- `/api/user/ingredients` - User ingredient management
- `/api/user/kitchen-utils` - User equipment management
- `/api/user/subscriptions` - Stripe subscription management
- `/api/ingredients` - Global ingredient catalog
- `/api/webhooks/clerk` and `/api/webhooks/stripe` - External webhooks
- `/health` - Health check (no auth)
- `/docs` - Swagger UI

## Authentication

Clerk JWT tokens via Bearer header. The `authMiddleware` verifies tokens and attaches `req.userId` to authenticated requests. Webhook routes bypass auth but verify signatures.

## External Services

- **Google Gemini** (`@google/genai`) - Recipe/ingredient generation, image detection
- **GetImg.ai** - AI image generation via REST
- **Supabase Storage** - Image storage
- **Clerk** - User authentication
- **Stripe** - Payment processing
- **Google Cloud Vision** - Image analysis

## Validation Pattern

All routes use Zod schemas with the `validate()` middleware:
```typescript
router.post('/create', validate(createRecipeSchema), createRecipe);
```

Schemas are in `src/api/schemas/` - one file per resource.

## Streaming (SSE)

Recipe creation streams events to the client: `title`, `recipe`, `image`, `error`. See `createRecipe` in recipes controller.

## Testing

Jest with ts-jest preset. Tests use `supertest` for HTTP assertions and `mongodb-memory-server` for in-memory database. Test files are in `__tests__/` directories.

## Environment Variables

Validated at startup via Zod in `src/utils/env.ts`. Required: `MONGODB_URI`, `GEMINI_API_KEY`, `CLERK_*`, `STRIPE_*`, Supabase credentials.
