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
 *         description:
 *           type: string
 *         ingredients:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               ingredient:
 *                 type: string
 *         steps:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               step:
 *                 type: string
 *               time:
 *                 type: string
 *               level:
 *                 type: string
 *       required:
 *         - title
 *         - ingredients
 *         - steps
 *         - time
 *         - level
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
});

export type Recipe = TypeOf<typeof recipeSchema>;
