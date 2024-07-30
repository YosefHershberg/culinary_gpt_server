import MessageResponse from "../../interfaces/MessageResponse";
import { base64ToArrayBuffer, hashString } from "../../utils/helperFunctions";
import * as recipeOperationsDB from "../data-access/recipe.da";
import { RecipeDocument } from "../models/recipe.model";
import { firebaseStorageOperations } from "./firebase.service";

export const recipeOperations = {
    getUserRecipes: async (userId: string): Promise<RecipeDocument[]> => {
        const recipes = await recipeOperationsDB.getRecipes(userId)
        return recipes
    },

    addRecipe: async (recipe: RecipeDocument): Promise<RecipeDocument> => {
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

        if (recipe.userId !== userId) {
            throw new Error('You are not authorized to delete this recipe')
        }

        await Promise.all([
            firebaseStorageOperations.deleteImage(hashString(recipe.recipe.description)),
            recipeOperationsDB.deleteRecipe(recipeId)
        ]);

        return { message: 'Recipe deleted' }
    },

    getRecipe: async (recipeId: string): Promise<RecipeDocument> => {
        const recipe = await recipeOperationsDB.getRecipe(recipeId)

        if (!recipe) {
            throw new Error('Recipe not found')
        }

        return recipe
    },
}
