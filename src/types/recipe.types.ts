import { TypeOf } from "zod";
import { recipeSchema } from "../api/schemas/recipe.schema";

export type Recipe = TypeOf<typeof recipeSchema>;

export type RecipeWithImage = {
    image_url: string;
    recipe: Recipe;
    userId: string;
    createdAt?: Date;
    id?: string;
}