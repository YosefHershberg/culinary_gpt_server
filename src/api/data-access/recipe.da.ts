import Recipe, { RecipeDocument } from "../models/recipe.model";
import { DeleteResult } from "mongodb";

export const getRecipes = async (userId: string): Promise<RecipeDocument[]> => {
    const recipes = await Recipe.find({ userId })

    return recipes;
}

export const addRecipe = async (recipe: RecipeDocument): Promise<RecipeDocument> => {
    const newRecipe = new Recipe(recipe);
    const savedRecipe = await newRecipe.save();
    return savedRecipe;
}

export const getRecipe = async (recipeId: string): Promise<RecipeDocument | null> => {
    const recipe = await Recipe.findById(recipeId);
    return recipe;
}

export const deleteRecipe = async (recipeId: string): Promise<RecipeDocument | null> => {
    const deletedRecipe = await Recipe.findByIdAndDelete(recipeId);
    return deletedRecipe;
}

export const deleteUserRecipes = async (userId: string): Promise<DeleteResult> => {
    const deletedRecipes = await Recipe.deleteMany({ userId });
    return deletedRecipes;
}