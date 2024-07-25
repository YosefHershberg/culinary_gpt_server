import Recipe from "../models/recipe.model";
import { Recipe as RecipeInterface } from "../../interfaces";

export const getRecipes = async (userId: string) => {
    const recipes = await Recipe.find({ userId })

    return recipes;
}


export const addRecipe = async (userId: string, recipe: RecipeInterface) => {
    try {
        const newRecipe = new Recipe({
            ...recipe,
            userId
        });
        const savedRecipe = await newRecipe.save();
        return savedRecipe;
    } catch (error: any) {
        console.log(error.message);
        throw new Error('An error acoured while creating recipe');
    }
}

export const getRecipe = async (recipeId: string) => {
    try {
        const recipe = await Recipe.findById(recipeId);
        return recipe;
    } catch (error: any) {
        console.log(error.message);
        throw new Error('An error acoured while getting recipe');
    }
}

export const deleteRecipe = async (recipeId: string) => {
    try {
        const deletedRecipe = await Recipe.findByIdAndDelete(recipeId);
        return deletedRecipe;
    } catch (error: any) {
        console.log(error.message);
        throw new Error('An error acoured while deleting recipe');
    }
}

export const deleteUserRecipes = async (userId: string) => {
    try {
        const deletedRecipes = await Recipe.deleteMany({ userId });
        return deletedRecipes;
    } catch (error: any) {
        console.log(error.message);
        throw new Error('An error acoured while deleting user recipes');
    }
}