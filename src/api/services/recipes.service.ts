import { base64ToArrayBuffer, hashString } from "../../utils/helperFunctions";
import { firebaseStorageOperations } from "./firebase.service";

import MessageResponse from "../../interfaces/MessageResponse";
import * as recipeOperationsDB from "../data-access/recipe.da";
import { RecipeDocument } from "../models/recipe.model";
import { RecipeWithImage } from "../../interfaces";

/**
 * @module recipes.service
 * 
 * @description This module provides operations for getting, adding and deleting recipes
 * @exports recipeOperations
 */

export const recipeOperations = {
    getUserRecipes: async (userId: string): Promise<RecipeDocument[]> => {
        const recipes = await recipeOperationsDB.getRecipes(userId)
        return recipes
    },

    addRecipe: async (recipe: RecipeWithImage): Promise<RecipeDocument> => {
        // Extract the base64 part
        const base64Image = recipe.image_url.replace(/^data:image\/(png|jpeg);base64,/, '');

        // Convert base64 to ArrayBuffer
        const imageBuffer = base64ToArrayBuffer(base64Image);

        const image_url = await firebaseStorageOperations.uploadImage(imageBuffer, hashString(recipe.recipe.description))

        const newRecipe = await recipeOperationsDB.addRecipe({...recipe, image_url} as RecipeDocument)

        return newRecipe
    },

    deleteRecipe: async (userId: string, recipeId: string): Promise<MessageResponse> => {
        const recipe = await recipeOperationsDB.getRecipe(recipeId)

        if (!recipe) {
            throw new Error('Recipe not found')
        }

        await Promise.all([
            firebaseStorageOperations.deleteImage(hashString(recipe.recipe.description)),
            recipeOperationsDB.deleteRecipe(recipeId)
        ]);

        return { message: 'Recipe deleted successfully' }
    },

    getRecipe: async (recipeId: string): Promise<RecipeDocument> => {
        const recipe = await recipeOperationsDB.getRecipe(recipeId)

        if (!recipe) {
            throw new Error('Recipe not found')
        }

        return recipe
    },
}
