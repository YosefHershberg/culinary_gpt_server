import { TypeOf, z } from "zod";

/**
 * @openapi
 * components:
 *   schemas:
 *     Ingredient:
 *       type: object
 *       properties:
 *         category:
 *           type: array
 *           items:
 *             type: string
 *         name:
 *           type: string
 *         id:
 *           type: string
 *       required:
 *         - category
 *         - name
 *         - id
 */


export const ingredientSchema = z.object({
    category: z.array(z.string()),
    name: z.string(),
    id: z.string().optional(),
})

export type Ingredient = TypeOf<typeof ingredientSchema>;