import openai from '../../config/openai';
import { compressBase64string, isValidJSON, returnStreamData } from "../../utils/helperFunctions";

import { PartialUserIngredientResponse as PartialIngredient, Recipe } from "../../interfaces";
import { getUserIngredientsByTypeDB } from "../data-access/userIngredient.da";
import logger from '../../config/logger';
import { Response } from 'express';
import env from '../../config/env';
import axios from 'axios';
import { createCocktailImagePrompt, createCocktailPrompt } from '../../utils/prompts';

/**
 * @module createCocktail.service
 * 
 * @description This module provides operations for creating a cocktail recipe
 * @note this service uses server sent events to stream data to the client. therefore, the response object is passed to the functions
 * 
 * @exports createCocktailOperations
 */

const createCocktailOperations = {

    /**
     * @description This function creates a cocktail recipe using OpenAI API and returns a valid JSON with image.
     * @param {string} userId
     * @param {string} prompt
     * @returns {RecipeWithImage}
     */
    createCocktail: async (userId: string, prompt: string, res: Response): Promise<void> => {
        const ingredients = await getUserIngredientsByTypeDB(userId, 'drink');

        // Check if there are enough ingredients to create a recipe
        if (ingredients.length < 4) {
            throw new Error('Not enough ingredients to create a recipe');
        }

        const userIngredients = ingredients.map((ingredient: PartialIngredient) => ingredient.name) as string[];

        // Create the recipe and the recipe image using OpenAI API
        const recipe = await createCocktailOperations.createCocktailOpenAI(prompt, userIngredients, res)
        const base64Image = await createCocktailOperations.createImageGetimgAI(recipe.title, userIngredients)

        // Compress the image
        const compressedBase64Image = await compressBase64string(base64Image as string, 60); // 30 KB

        // Prepare the image data for the client
        const base64DataUrl = `data:image/jpeg;base64,${compressedBase64Image}`;

        // Stream the image
        return returnStreamData(res, { event: 'image', data: base64DataUrl });
    },

    /**
     * @description This function creates a cocktail recipe using OpenAI API and returns a valid JSON.
     * @param {string[]} userIngredients
     * @returns {Recipe} recipe
     */
    createCocktailOpenAI: async (prompt: string, userIngredients: string[], res: Response): Promise<Recipe> => {
        const maxRetries = 3;
        let attempts = 0;
        let isValidJson = false;
        let recipe = null;

        while (attempts < maxRetries && !isValidJson) {
            try {
                const completion = await openai.chat.completions.create({
                    messages: [{
                        role: "user",
                        content: createCocktailPrompt(userIngredients, prompt),
                    }],
                    model: "gpt-3.5-turbo",
                });

                const response = completion.choices[0].message.content as string;
                isValidJson = isValidJSON(response);

                if (isValidJson) {
                    recipe = JSON.parse(response);
                }
            } catch (error: any) {
                logger.error(error.message);
                attempts++;
            }
        }

        if (!isValidJson) {
            throw new Error('No valid JSON response generated');
        }

        returnStreamData(res, { event: 'recipe', data: recipe });
        return recipe;
    },

    /**
     * @description This function creates an image using OpenAI API.
     * @param {string} cocktailTitle
     * @param {string[]} userIngredients
     * @returns {string} valid base64 image
     */
    createImageOpenAI: async (cocktailTitle: string, userIngredients: string[]): Promise<string> => {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: createCocktailImagePrompt(cocktailTitle, userIngredients),
            n: 1,
            size: "1024x1024",
            quality: 'standard',
            style: 'vivid',
            response_format: 'b64_json',
        });

        const imageUrl = response.data[0].b64_json as string;

        return imageUrl;
    },

    /**
     * @description This function creates an image using GetimgAI API.
     * @param cocktailTitle 
     * @param userIngredients 
     * @returns 
     */
    createImageGetimgAI: async (cocktailTitle: string, userIngredients: string[]): Promise<string> => {
        const url = 'https://api.getimg.ai/v1/flux-schnell/text-to-image';
        const headers = {
            Authorization: `Bearer ${env.GETIMGAI_API_KEY}`,
        };

        const { data } = await axios.post(url, {
            prompt: createCocktailImagePrompt(cocktailTitle, userIngredients),
        }, { headers });


        return data.image
    }
};

export default createCocktailOperations