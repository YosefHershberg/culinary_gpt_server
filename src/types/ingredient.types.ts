import { TypeOf } from "zod";
import { ingredientSchema } from "../api/schemas/ingredient.schema";

export type Ingredient = TypeOf<typeof ingredientSchema>;

export type UserIngredient = Omit<Ingredient, 'popularity' | 'category'>;

export type IngredientType = "food" | "drink";