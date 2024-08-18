import { z } from "zod";

export const doSomethingByIdSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});

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
 * 
 *     KitchenUtils:
 *       type: object
 *       properties:
 *         Stove Top:
 *           type: boolean
 *           example: true
 *         Oven:
 *           type: boolean
 *           example: false
 *         Microwave:
 *           type: boolean
 *           example: true
 *         Air Fryer:
 *           type: boolean
 *           example: false
 *         Blender:
 *           type: boolean
 *           example: true
 *         Food Processor:
 *           type: boolean
 *           example: false
 *         Slow Cooker:
 *           type: boolean
 *           example: true
 *         BBQ:
 *           type: boolean
 *           example: false
 *         Grill:
 *           type: boolean
 *           example: true
 *       required:
 *         - Stove Top
 *         - Oven
 *         - Microwave
 *         - Air Fryer
 *         - Blender
 *         - Food Processor
 *         - Slow Cooker
 *         - BBQ
 *         - Grill
 */