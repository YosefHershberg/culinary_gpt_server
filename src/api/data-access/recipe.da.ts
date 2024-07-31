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

export const getRecipe = async (recipeId: string): Promise<RecipeDocument> => {
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
        throw new Error('Recipe not found');
    }

    return recipe;
}

export const deleteRecipe = async (recipeId: string): Promise<RecipeDocument> => {
    const deletedRecipe = await Recipe.findByIdAndDelete(recipeId);

    if (!deletedRecipe) {
        throw new Error('Recipe not found');
    }

    return deletedRecipe;
}

export const deleteUserRecipes = async (userId: string): Promise<DeleteResult> => {
    const deletedRecipes = await Recipe.deleteMany({ userId });
    return deletedRecipes;
}