import { Response } from 'express';
import { v4 as uuid } from 'uuid';

import aiServices from './ai.service';
import { getUserIngredientsByTypeDB } from "../data-access/userIngredient.da";
import { createCocktailImagePrompt, createCocktailPrompt, createCocktailTitlePrompt } from '../../utils/prompts';

import { compressBase64string, returnStreamData } from "../../utils/helperFunctions";
import { Recipe } from '../schemas/recipe.schema';
import { UserIngredient } from "../../types";

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
     * @param {Response} res
     * @returns {RecipeWithImage}
     */
    createCocktail: async (userId: string, prompt: string, res: Response): Promise<void> => {
        const ingredients = await getUserIngredientsByTypeDB(userId, 'drink');

        // Check if there are enough ingredients to create a recipe
        if (ingredients.length < 4) {
            throw new Error('Not enough ingredients to create a recipe');
        }

        const userIngredients = ingredients.map((ingredient: UserIngredient) => ingredient.name);

        const cocktailTitlePrompt = createCocktailTitlePrompt(userIngredients, prompt);

        const { title: cocktailTitle } = await aiServices.openaiCreate<{ title: string }>(cocktailTitlePrompt);

        const imagePrompt = createCocktailImagePrompt(cocktailTitle);
        const cocktailPrompt = createCocktailPrompt(userIngredients, prompt, cocktailTitle);

        const [base64image] = await Promise.all([
            // Create the cocktail image using GetimgAI API
            aiServices.createImageGetimgAI(imagePrompt),

            // Create the cocktail recipe using OpenAI API
            createCocktailServices.createCocktailService(cocktailPrompt, res)
        ]);

        // Compress the image
        const compressedBase64Image = await compressBase64string(base64image as string, 60); // 30 KB

        // for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${compressedBase64Image}`;

        return returnStreamData(res, { event: 'image', payload: base64DataUrl });
    },

    /**
     * @description This function creates a cocktail recipe using OpenAI API and returns a valid JSON
     * @param {string} cocktailPrompt
     * @param {Response} res
     * @returns {Recipe} recipe
     */
    createCocktailService: async (cocktailPrompt: string, res: Response): Promise<void> => {
        let recipe = await aiServices.openaiCreate<Recipe>(cocktailPrompt);

        // This is relevant for deleting the recipe
        recipe.id = uuid();

        return returnStreamData(res, { event: 'recipe', payload: recipe });
    },
};

export default createCocktailServices
