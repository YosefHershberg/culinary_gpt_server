import { getUserPageRecipesProps } from "../../interfaces/ServiceInterfaces";
import Recipe, { RecipeDocument } from "../models/recipe.model";
import { DeleteResult } from "mongodb";

/**
 * @description Get a page of recipes from the database
 * @param param0 
 * @returns 
 */
export const getRecipesPageDB = async ({ userId, page, limit }: getUserPageRecipesProps): Promise<RecipeDocument[]> => {
    const recipes = await Recipe.find({ userId: userId })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

    if (!recipes) {
        throw new Error('Recipes not found');
    }

    return recipes;
}

export const getRecipesPageByQueryDB = async ({ userId, page, limit, query }: getUserPageRecipesProps): Promise<RecipeDocument[]> => {

    const recipes = await Recipe.find({ userId, 'recipe.title': { $regex: query, $options: 'i' } })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

    if (!recipes) {
        throw new Error('Recipes not found');
    }

    return recipes;
}

export const getAllRecipesDB = async (userId: string): Promise<RecipeDocument[]> => {
    const recipes = await Recipe.find({ userId }).exec();

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