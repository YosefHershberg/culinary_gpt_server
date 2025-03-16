import type { TypeOf } from "zod";
import { ingredientSchema } from "../api/schemas/ingredient.schema";

export type Ingredient = TypeOf<typeof ingredientSchema>;

export type UserIngredientResponse = Omit<Ingredient, 'popularity' | 'category'>;

export type IngredientType = "food" | "drink";

export type UserIngredient = {
    userId: string;
    ingredientId: string;
    name: string;
    type: IngredientType[];
}