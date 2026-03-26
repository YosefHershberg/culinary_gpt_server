import { z } from "zod";

/**
 * @description Ingredient validation schema
 * @note Used for request validation. The Prisma schema is the single source of truth for types.
 */

export const ingredientSchema = z.object({
    category: z.array(z.string()),
    name: z.string(),
    id: z.string(),
    popularity: z.number(),
    type: z.array(z.enum(['food', 'drink'])),
})

/**
 * @openapi
 * components:
 *   schemas:
 *     Ingredient:
 *       type: object
 *       required:
 *         - category
 *         - name
 *         - id
 *       properties:
 *         category:
 *           type: array
 *           items:
 *             type: string
 *           default: ['Vegetables']
 *         name:
 *           type: string
 *           default: 'Tomato'
 *         id:
 *           type: string
 *           default: '123'
 *         popularity:
 *           type: number
 *           default: 1
 *         type:
 *           type: string
 *           enum:
 *             - food
 *             - drink
 *           default: 'food'
 *       example:
 *         category: ['Vegetables']
 *         name: 'Tomato'
 *         id: '123'
 *         type: 'food'
 */