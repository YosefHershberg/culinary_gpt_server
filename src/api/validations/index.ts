import { z } from "zod";

//NOTE: THERE ARE MORE SCHEMAS IN THE CONTROLLERS! THIS IS THE SCHEMAS BASED IN THE GLOBALE INTERFACES

//NOTE: WHEN MAKE CHANGES HERE MAKE SAME CHANGES IN interfaces/index.ts

export const ingredientSchema = z.object({
    category: z.array(z.enum(['common', 'dairy', 'vegetables', 'spices', 'carbs', 'meat'])),
    name: z.string(),
    id: z.string(),
})

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
    title: z.string().min(3).max(100),
    description: z.string().max(500),
    ingredients: z.array(z.object({
        ingredient: z.string().min(2)
    })).min(1),
    steps: z.array(stepSchema).min(1),
    time: z.string(),
    level: z.string(),
});

export const doSomethingByIdSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});