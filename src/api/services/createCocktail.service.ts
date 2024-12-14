import axios from 'axios';
import { Response } from 'express';

import { getUserIngredientsByTypeDB } from "../data-access/userIngredient.da";

import openai from '../../config/openai';
import logger from '../../config/logger';
import env from '../../config/env';

import { createCocktailImagePrompt, createCocktailPrompt, createCocktailTitlePrompt } from '../../utils/prompts';
import { compressBase64string, isValidJSON, returnStreamData } from "../../utils/helperFunctions";
import { PartialUserIngredientResponse as PartialIngredient, Recipe } from "../../interfaces";

/**
 * @module createCocktail.service
 * 
 * @description This module provides operations for creating a cocktail recipe
 * @note this service uses server sent events to stream data to the client. therefore, the response object is passed to the functions
 * 
 * @exports createCocktailOperations
 */


interface createCocktailOpenAIProps {
    prompt: string;
    userIngredients: PartialIngredient[];
    cocktailTitle: string;
    res: Response;
}

const createCocktailOperations = {

    /**
     * @description This function creates a cocktail recipe and returns a valid JSON with image
     * @note We create the title first and then the recipe and image simultaneously. This way is faster.
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

        const userIngredients = ingredients.map((ingredient: PartialIngredient) => ingredient.name) as PartialIngredient[];

        // Create a cocktail title using OpenAI API
        const cocktailTitle = await createCocktailOperations.createCocktailTitleOpenAI(userIngredients, prompt);

        const [base64image] = await Promise.all([
            // Create the cocktail image using GetimgAI API
            createCocktailOperations.createImageGetimgAI(cocktailTitle, userIngredients),

            // Create the cocktail recipe using OpenAI API
            createCocktailOperations.createCocktailOpenAI({ prompt, userIngredients, cocktailTitle, res })
        ]);

        // Compress the image
        const compressedBase64Image = await compressBase64string(base64image as string, 60); // 30 KB

        // for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${compressedBase64Image}`;

        return returnStreamData(res, { event: 'image', data: base64DataUrl });
    },

    /**
     * @description This function creates a cocktail title using OpenAI API
     * @param {PartialIngredient[]} userIngredients 
     * @param {string} prompt
     * @returns {string} cocktail title
     */
    createCocktailTitleOpenAI: async (userIngredients: PartialIngredient[], prompt: string): Promise<string> => {
        const maxRetries = 3;
        let attempts = 0;
        let isValidJson = false;

        let title = null;

        while (attempts < maxRetries && !isValidJson) { // Retry until a valid JSON is generated
            try {
                const completion = await openai.chat.completions.create({
                    messages: [{
                        role: "user",
                        content: createCocktailTitlePrompt(userIngredients, prompt)
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
     * @param {object} params - The parameters object
     * @param {string} params.prompt 
     * @param {string[]} params.userIngredients 
     * @param {string} params.cocktailTitle 
     * @param {Response} params.res 
     * @returns {Recipe} cocktail recipe
     */
    createCocktailOpenAI: async ({ prompt, userIngredients, cocktailTitle, res }: createCocktailOpenAIProps): Promise<Recipe> => {
        const maxRetries = 3;
        let attempts = 0;
        let isValidJson = false;

        let recipe = null;

        while (attempts < maxRetries && !isValidJson) { // Retry until a valid JSON is generated
            try {
                const completion = await openai.chat.completions.create({
                    messages: [{
                        role: "user",
                        content: createCocktailPrompt(
                            userIngredients, prompt, cocktailTitle
                        )
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
                attempts++;
            }
        }

        if (!isValidJson) {
            throw new Error('No valid JSON response generated for cocktail recipe');
        }

        returnStreamData(res, { event: 'recipe', data: recipe });
        return recipe;
    },

    /**
     * @description This function creates an image using OpenAI API
     * @param {string} cocktailTitle
     * @param {PartialIngredient[]} userIngredients
     * @returns {string} valid base64 image
     */
    createImageOpenAI: async (cocktailTitle: string, userIngredients: PartialIngredient[]): Promise<string> => {
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
     * @description This function creates an image using GetimgAI API
     * @param {string} cocktailTitle
     * @param {PartialIngredient[]} userIngredients
     * @returns {string} base64 image
     */
    createImageGetimgAI: async (cocktailTitle: string, userIngredients: PartialIngredient[]): Promise<string> => {
        const url = 'https://api.getimg.ai/v1/flux-schnell/text-to-image';
        const headers = {
            Authorization: `Bearer ${env.GETIMGAI_API_KEY}`,
        };

        const { data } = await axios.post(url, {
            prompt: createCocktailImagePrompt(cocktailTitle, userIngredients),
        }, { headers });

        return data.image;
    }
};

export default createCocktailOperations