import { TypeOf, z } from "zod";

/**
 * @openapi
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 500
 *         ingredients:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               ingredient:
 *                 type: string
 *                 minLength: 2
 *         steps:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               step:
 *                 type: string
 *               time:
 *                 type: string
 *         time:
 *           type: string
 *         level:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - recipe
 *             - cocktail
 *       required:
 *         - title
 *         - ingredients
 *         - steps
 *         - time
 *         - level
 *         - type
 */

export const recipeSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().max(500),
    ingredients: z.array(z.object({
        ingredient: z.string().min(2)
    })).min(1),
    steps: z.array(z.object({
        step: z.string(),
        time: z.string()
    })).min(1),
    time: z.string(),
    level: z.string(),
    type: z.enum(['recipe', 'cocktail'])
});

export type Recipe = TypeOf<typeof recipeSchema>;
