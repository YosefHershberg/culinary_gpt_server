import { z } from "zod";

//NOTE: THERE ARE MORE SCHEMAS IN THE CONTROLLERS! THIS IS THE SCHEMAS BASED IN THE GLOBALE INTERFACES

//NOTE: WHEN MAKE CHANGES HERE MAKE SAME CHANGES IN interfaces/index.ts

export const ingredientSchema = z.object({
    category: z.array(z.string()),
    name: z.string(),
    id: z.string().optional(),
});

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

const stepSchema = z.object({
    step: z.string(),
    time: z.string()
});

export const recipeSchema = z.object({
    title: z.string(),
    description: z.string(),
    ingredients: z.array(ingredientSchema),
    steps: z.array(stepSchema),
    time: z.string(),
    level: z.string(),
    id: z.string().optional()
});
