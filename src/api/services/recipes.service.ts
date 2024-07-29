import MessageResponse from "../../interfaces/MessageResponse";
import { uploadBase64ImageToStorage } from "../../utils/uploadImage";
import * as recipeOperationsDB from "../data-access/recipe.da";
import { RecipeDocument } from "../models/recipe.model";

export const recipeOperations = {
    getAll: async (userId: string): Promise<RecipeDocument[]> => {
        const recipes = await recipeOperationsDB.getRecipes(userId)
        return recipes
    },

    addRecipe: async (recipe: RecipeDocument): Promise<RecipeDocument> => {
        const image_url = await uploadBase64ImageToStorage(recipe.image_url, Date.now().toString())

        const newRecipe = await recipeOperationsDB.addRecipe({...recipe, image_url} as RecipeDocument)

        return newRecipe
    },

    deleteRecipe: async (userId: string, recipeId: string): Promise<MessageResponse> => {
        await recipeOperationsDB.deleteRecipe(recipeId)
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
