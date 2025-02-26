import { Ingredient } from "../api/schemas/ingredient.schema";
import { Recipe } from "../api/schemas/recipe.schema";

/**
 * @fileoverview types for the application
 */

export type UserIngredient = Omit<Ingredient, 'popularity' | 'category'>;

export type RecipeWithImage = {
    image_url: string;
    recipe: Recipe;
}

export type IngredientType = "food" | "drink";


