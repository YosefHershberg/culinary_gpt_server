import Recipe, { RecipeDocument } from "../models/recipe.model";
import { Recipe as RecipeInterface } from "../../interfaces";
import { DeleteResult } from "mongodb";

export const getRecipes = async (userId: string): Promise<RecipeDocument[]> => {
    const recipes = await Recipe.find({ userId })

    return recipes;
}

export const addRecipe = async (userId: string, recipe: RecipeInterface): Promise<RecipeDocument> => {
    const newRecipe = new Recipe({
        ...recipe,
        userId
    });
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