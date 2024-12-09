import Recipe, { RecipeDocument } from "../models/recipe.model";
import { DeleteResult } from "mongodb";

export const getRecipesDB = async (userId: string): Promise<RecipeDocument[]> => {
    const recipes = await Recipe.find({ userId }).exec()

    if (!recipes) {
        throw new Error('Recipes not found');
    }

    return recipes;
}

export const addRecipeDB = async (recipe: RecipeDocument): Promise<RecipeDocument> => {
    const newRecipe = new Recipe(recipe);
    const savedRecipe = await newRecipe.save();
    return savedRecipe;
}

export const getRecipeDB = async (recipeId: string): Promise<RecipeDocument> => {
    const recipe = await Recipe.findById(recipeId).exec();

    if (!recipe) {
        throw new Error('Recipe not found');
    }

    return recipe;
}

export const deleteRecipeDB = async (recipeId: string): Promise<RecipeDocument> => {
    const deletedRecipe = await Recipe.findByIdAndDelete(recipeId).exec();

    if (!deletedRecipe) {
        throw new Error('Recipe not found');
    }

    return deletedRecipe;
}

export const deleteUserRecipesDB = async (userId: string): Promise<DeleteResult> => {
    const deletedRecipes = await Recipe.deleteMany({ userId }).exec();
    return deletedRecipes;
}