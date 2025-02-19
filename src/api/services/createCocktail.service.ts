import axios from 'axios';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';

import openai from '../../config/openai';
import logger from '../../config/logger';
import env from '../../utils/env';

import { getUserIngredientsByTypeDB } from "../data-access/userIngredient.da";
import { createCocktailImagePrompt, createCocktailPrompt, createCocktailTitlePrompt } from '../../utils/prompts';
import { compressBase64string, isValidJSON, returnStreamData } from "../../utils/helperFunctions";
import { UserIngredient } from "../../interfaces";

/**
 * @module createRecipe.service
 * 
 * @description This module provides operations for creating a recipe
 * @note this service uses server sent events to stream data to the client. therefore, the response object is passed to the functions
 * 
 * @exports createRecipeOperations
 */

const MAX_RETRIES = 5;

const createCocktailOperations = {

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

        // Create a cocktail title using OpenAI API
        const cocktailTitle = await createCocktailOperations.createCocktailTitleOpenAI(cocktailTitlePrompt);

        const imagePrompt = createCocktailImagePrompt(cocktailTitle, userIngredients);
        const cocktailPrompt = createCocktailPrompt(userIngredients, prompt, cocktailTitle);

        const [base64image] = await Promise.all([
            // Create the cocktail image using GetimgAI API
            createCocktailOperations.createImageGetimgAI(imagePrompt),

            // Create the cocktail recipe using OpenAI API
            createCocktailOperations.createCocktailOpenAI(cocktailPrompt, res)
        ]);

        // Compress the image
        const compressedBase64Image = await compressBase64string(base64image as string, 60); // 30 KB

        // for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${compressedBase64Image}`;

        return returnStreamData(res, { event: 'image', payload: base64DataUrl });
    },

    /**
     * @description This function creates a cocktail title using OpenAI API
     * @param {string} cocktailTitlePrompt
     * @returns {string} cocktail title
     */
    createCocktailTitleOpenAI: async (cocktailTitlePrompt: string): Promise<string> => {
        let attempts = 0;
        let isValidJson = false;

        let title = null;

        while (attempts < MAX_RETRIES && !isValidJson) { // Retry until a valid JSON is generated

            console.log('attempts title', attempts);

            try {
                const completion = await openai.chat.completions.create({
                    messages: [{
                        role: "user",
                        content: cocktailTitlePrompt
                    }],
                    model: "gpt-3.5-turbo",
                });

                const response = completion.choices[0].message.content as string;

                isValidJson = isValidJSON(response);

                if (isValidJson) {
                    const parsedResponse = JSON.parse(response);
                    title = parsedResponse.title;
                }
            } catch (error: any) {
                logger.error(error);
            } finally {
                attempts++;
            }
        }

        if (!isValidJson) {
            throw new Error('No valid JSON response generated for cocktail title');
        }

        return title;
    },

    /**
     * @description This function creates a cocktail recipe using OpenAI API and returns a valid JSON
     * @param {string} cocktailPrompt
     * @param {Response} res
     * @returns {Recipe} recipe
     */
    createCocktailOpenAI: async (cocktailPrompt: string, res: Response): Promise<void> => {
        const maxRetries = 3;
        let attempts = 0;
        let isValidJson = false;

        let recipe = null;

        while (attempts < maxRetries && !isValidJson) { // Retry until a valid JSON is generated


            try {
                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: "You are an professional mixologist." },
                        {
                            role: "user",
                            content: cocktailPrompt
                        }],
                    model: "gpt-3.5-turbo",
                });

                const response = completion.choices[0].message.content as string;

                isValidJson = isValidJSON(response);

                if (isValidJson) {
                    recipe = JSON.parse(response);
                }
            } catch (error) {
                logger.error(error);
            } finally {
                attempts++;
            }
        }

        if (!isValidJson) {
            throw new Error('No valid JSON response generated for cocktail recipe');
        }

        // This is relevant for deleting the recipe
        recipe.id = uuid();

        return returnStreamData(res, { event: 'recipe', payload: recipe });
    },

    /**
     * @description This function creates an image using GetimgAI API
     * @param {string} imagePrompt
     * @returns {string} base64 image
     */
    createImageGetimgAI: async (imagePrompt: string): Promise<string> => {
        const url = 'https://api.getimg.ai/v1/flux-schnell/text-to-image';
        const headers = {
            Authorization: `Bearer ${env.GETIMGAI_API_KEY}`,
        };

        const { data } = await axios.post(url, {
            prompt: imagePrompt,
        }, { headers });

        return data.image;
    }
};

export default createCocktailOperations
