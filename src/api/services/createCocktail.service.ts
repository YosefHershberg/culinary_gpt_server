import { v4 as uuid } from 'uuid';

import aiServices from './ai.service';
import { getUserIngredientsByTypeDB } from "../data-access/userIngredient.da";

import { createCocktailPrompt, createCocktailSchema, createCocktailImagePrompt, createCocktailTitlePrompt, createTitleSchema } from '../../utils/prompts&schemas/createCocktail';
import { compressBase64string } from "../../utils/helperFunctions";

import type { RecipeContent, UserIngredientResponse } from "../../types";

/**
 * @module createRecipe.service
 * 
 * @description This module provides services for creating a recipe
 * @note this service uses server sent events to stream data to the client. therefore, the response object is passed to the functions
 * 
 * @exports createRecipeServices
 */

const createCocktailServices = {

    /**
     * @description This function creates a cocktail recipe and returns a valid JSON with image
     * @note We create the title first and then the recipe and image simultaneously. This way is faster.
     * @param {string} userId
     * @param {string} prompt
     * @param {(data: { event: string, payload: any }) => void} streamData
     * @returns {RecipeWithImage}
     */
    createCocktail: async (userId: string, prompt: string, streamData: (data: { event: string, payload: any }) => void): Promise<void> => {
        const ingredients = await getUserIngredientsByTypeDB(userId, 'drink');

        // Check if there are enough ingredients to create a recipe
        if (ingredients.length < 4) {
            throw new Error('Not enough ingredients to create a recipe');
        }

        const userIngredients = ingredients.map((ingredient: UserIngredientResponse) => ingredient.name);

        const cocktailTitlePrompt = createCocktailTitlePrompt(userIngredients, prompt);

        const { title: cocktailTitle } = await aiServices.geminiCreate<{
            title: string, 
        }>(cocktailTitlePrompt, createTitleSchema);

        const imagePrompt = createCocktailImagePrompt(cocktailTitle);
        const cocktailPrompt = createCocktailPrompt(userIngredients, prompt, cocktailTitle);

        const [base64image] = await Promise.all([
            // Create the cocktail image using GetimgAI API
            aiServices.createImageGetimgAI(imagePrompt),

            // Create the cocktail recipe using Gemini API
            createCocktailServices.createCocktailService(cocktailPrompt, streamData)
        ]);

        // Compress the image
        const compressedBase64Image = await compressBase64string(base64image as string, 60); // 30 KB

        // for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${compressedBase64Image}`;

        return streamData({ event: 'image', payload: base64DataUrl });
    },

    /**
     * @description This function creates a cocktail recipe using gemini API and returns a valid JSON
     * @param {string} cocktailPrompt
     * @param {(data: { event: string, payload: any }) => void} streamData
     * @returns {Recipe} recipe
     */
    createCocktailService: async (cocktailPrompt: string, streamData: (data: { event: string, payload: any }) => void): Promise<void> => {
        let recipe = await aiServices.geminiCreate<RecipeContent>(cocktailPrompt, createCocktailSchema);

        /** @description Unique identifier used as the Supabase Storage filename for the recipe image. Used for uploading and deleting the image. */
        recipe.id = uuid();

        return streamData({ event: 'recipe', payload: recipe });
    },
};

export default createCocktailServices
