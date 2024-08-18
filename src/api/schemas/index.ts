import { z } from "zod";

/**
 * @openapi
 * components:
 *   schemas:
 *     MessageResponse:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           default: 'Operation successful'
 */

export const doSomethingByIdSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});