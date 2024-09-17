import { TypeOf, z } from "zod";

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

export const ingredientSchema = z.object({
    category: z.array(z.string()),
    name: z.string(),
    id: z.string(),
    type: z.array(z.enum(['food', 'drink'])),
})

export type Ingredient = TypeOf<typeof ingredientSchema>;