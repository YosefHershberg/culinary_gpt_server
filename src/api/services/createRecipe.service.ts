import { v4 as uuid } from 'uuid';

import aiServices from './ai.service';
import { getUserIngredientsByTypeDB } from "../data-access/userIngredient.da";
import { getKitchenUtilsDB } from '../data-access/kitchenUtils.da';

import { compressBase64string } from "../../utils/helperFunctions";
import { createRecipePrompt, createRecipeSchema, createRecipeTitlePrompt, createTitleSchema, createRecipeImagePrompt } from '../../utils/prompts&schemas/createRecipe';

import type { RecipeContent, UserIngredientResponse } from "../../types";

/**
 * @module createRecipe.service
 * 
 * @description This module provides services for creating a recipe
 * @note this service uses server sent events to stream data to the client. therefore, the response object is passed to the functions
 * 
 * @exports createRecipeServices
 */

export type CreateRecipeProps = {
    mealSelected: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
    selectedTime: number;
    prompt: string;
    numOfPeople: number;
}

const createRecipeServices = {

    /**
     * @description This function creates a recipe and returns a valid JSON with image
     * @note We create the title first and then the recipe and image simultaneously. This way is faster.
     * @param {string} userId
     * @param {CreateRecipeProps} recipeInput
     * @param {(data: { event: string, payload: any }) => void} streamData
     * @returns {RecipeWithImage}
     */
    createRecipe: async (userId: string, recipeInput: CreateRecipeProps, streamData: (data: { event: string, payload: any }) => void): Promise<void> => {

        const [ingredients, kitchenUtils] = await Promise.all([
            getUserIngredientsByTypeDB(userId, 'food'),
            getKitchenUtilsDB(userId)
        ]);

        // Check if there are enough ingredients to create a recipe
        if (ingredients.length < 4) {
            throw new Error('Not enough ingredients to create a recipe');
        }

        const userIngredients = ingredients.map((ingredient: UserIngredientResponse) => ingredient.name);

        const recipeTitlePrompt = createRecipeTitlePrompt(userIngredients, recipeInput.prompt, kitchenUtils);

        const { title: recipeTitle } = await aiServices.geminiCreate<{
            title: string
        }>(recipeTitlePrompt, createTitleSchema);

        const imagePrompt = createRecipeImagePrompt(recipeTitle);
        const recipePrompt = createRecipePrompt({ ...recipeInput, userIngredients, recipeTitle, kitchenUtils });

        const [base64image] = await Promise.all([
            // Create the recipe image using GetimgAI API
            aiServices.createImageGetimgAI(imagePrompt),

            // Create the recipe using Gemini API
            createRecipeServices.createRecipeService(recipePrompt, streamData)
        ]);

        // Compress the image
        const compressedBase64Image = await compressBase64string(base64image as string, 60); // 30 KB

        // for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${compressedBase64Image}`;

        return streamData({ event: 'image', payload: base64DataUrl });
    },

    /**
     * @description This function creates a recipe using Gemini API and returns a valid JSON
     * @param {string} recipePrompt
     * @param {(data: { event: string, payload: any }) => void} streamData
     * @returns {Recipe} recipe
     */
    createRecipeService: async (recipePrompt: string, streamData: (data: { event: string, payload: any }) => void): Promise<void> => {
        let recipe = await aiServices.geminiCreate<RecipeContent>(recipePrompt, createRecipeSchema);

        /** @description Unique identifier used as the Supabase Storage filename for the recipe image. Used for uploading and deleting the image. */
        recipe.id = uuid();

        return streamData({ event: 'recipe', payload: recipe });
    },
};

export default createRecipeServices