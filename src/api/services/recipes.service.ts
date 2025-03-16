import firebaseStorageServices from "./firebase.service";
import { addRecipeDB, deleteRecipeDB, getAllRecipesDB, getRecipeDB, getRecipesPageDB } from "../data-access/recipe.da";
import { base64ToArrayBuffer } from "../../utils/helperFunctions";

import type { MessageResponse, RecipeWithImage, GetUserPageRecipesProps } from "../../types";

/**
 * @module recipes.service
 * 
 * @description This module provides Services for getting, adding and deleting recipes
 * @exports recipeServices
 */

const recipeServices = {

    /**
     * @description Get a page of recipes from the database. If there is a query, get recipes by query
     * @param props 
     * @returns {RecipeWithImage[]} 
     */
    getUserPageRecipes: async (props: GetUserPageRecipesProps): Promise<RecipeWithImage[]> => {
        const recipes = await getRecipesPageDB(props)

        return recipes
    },

    /**
     * @description Get all recipes from the database
     * @param userId 
     * @returns {RecipeWithImage[]} 
     */
    getAllUserRecipes: async (userId: string): Promise<RecipeWithImage[]> => {
        const recipes = await getAllRecipesDB(userId)

        return recipes
    },

    /**
     * @description Converts the base64 image to an ArrayBuffer and uploads it to Firebase Storage and saves the link to it in the recipe to the DB
     * @param recipe
     * @returns {RecipeWithImage}
     */
    addRecipe: async (recipe: RecipeWithImage): Promise<RecipeWithImage> => {
        // Extract the base64 part
        const base64Image = recipe.image_url.replace(/^data:image\/(png|jpeg);base64,/, '');

        // Convert base64 to ArrayBuffer
        const imageBuffer = base64ToArrayBuffer(base64Image);

        const image_url = await firebaseStorageServices.uploadImage(imageBuffer, recipe.recipe.id);

        const newRecipe = await addRecipeDB({ ...recipe, image_url } as RecipeWithImage)

        return newRecipe
    },

    /**
     * @description Delete a recipe from the database and the image from Firebase Storage
     * @param recipeId 
     * @returns {MessageResponse}
     */
    deleteRecipe: async (recipeId: string): Promise<MessageResponse> => {
        const recipe = await getRecipeDB(recipeId)

        if (!recipe) {
            throw new Error('Recipe not found')
        }

        await Promise.all([
            firebaseStorageServices.deleteImage(recipe.recipe.id),
            deleteRecipeDB(recipeId)
        ]);

        return { message: 'Recipe deleted successfully' }
    },

    /**
     * @description Get a recipe by its id
     * @param recipeId 
     * @returns {RecipeWithImage}
     */
    getRecipeById: async (recipeId: string): Promise<RecipeWithImage> => {
        const recipe = await getRecipeDB(recipeId)

        if (!recipe) {
            throw new Error('Recipe not found')
        }

        return recipe
    },
}

export default recipeServices
