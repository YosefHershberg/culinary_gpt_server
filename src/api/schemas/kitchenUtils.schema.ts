import { TypeOf, z } from "zod";

/**
 * @openapi
 * components:
 *   schemas:
 *     KitchenUtils:
 *       type: object
 *       properties:
 *         StoveTop:
 *           type: boolean
 *         Oven:
 *           type: boolean
 *         Microwave:
 *           type: boolean
 *         AirFryer:
 *           type: boolean
 *         Blender:
 *           type: boolean
 *         FoodProcessor:
 *           type: boolean
 *         SlowCooker:
 *           type: boolean
 *         BBQ:
 *           type: boolean
 *         Grill:
 *           type: boolean
 *       required:
 *         - StoveTop
 *         - Oven
 *         - Microwave
 *         - AirFryer
 *         - Blender
 *         - FoodProcessor
 *         - SlowCooker
 *         - BBQ
 *         - Grill
 */

export const kitchenUtilsSchema = z.object({
    "Stove Top": z.boolean(),
    "Oven": z.boolean(),
    "Microwave": z.boolean(),
    "Air Fryer": z.boolean(),
    "Blender": z.boolean(),
    "Food Processor": z.boolean(),
    "Slow Cooker": z.boolean(),
    "BBQ": z.boolean(),
    "Grill": z.boolean(),
});

export type KitchenUtils = TypeOf<typeof kitchenUtilsSchema>;
