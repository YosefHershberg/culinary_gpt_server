import axios from 'axios';
import { Response } from 'express';

import { getUserIngredientsByTypeDB } from "../data-access/userIngredient.da";
import { getKitchenUtilsDB } from '../data-access/kitchenUtils.da';

import openai from '../../config/openai';
import env from '../../config/env';
import logger from '../../config/logger';

import { compressBase64string, isValidJSON, returnStreamData } from "../../utils/helperFunctions";
import { createRecipeImagePrompt, createRecipePrompt, createRecipeTitlePrompt } from '../../utils/prompts';
import { PartialUserIngredientResponse as PartialIngredient, KitchenUtils, Recipe } from "../../interfaces";

/**
 * @module createRecipe.service
 * 
 * @description This module provides operations for creating a recipe
 * @note this service uses server sent events to stream data to the client. therefore, the response object is passed to the functions
 * 
 * @exports createRecipeOperations
 */

export interface CreateRecipeProps {
    mealSelected: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
    selectedTime: number;
    prompt: string;
    numOfPeople: number;
}

interface createRecipeOpenAIProps {
    recipeInput: CreateRecipeProps,
    userIngredients: PartialIngredient[],
    kitchenUtils: KitchenUtils,
    recipeTitle: string,
    res: Response
}

const createRecipeOperations = {

    /**
     * @description This function creates a recipe using OpenAI API and returns a valid JSON
     * @note We create the title first and then the recipe and image simultaneously. This way is faster.
     * @param {string} userId
     * @param {CreateRecipeProps} recipeInput
     * @returns {RecipeWithImage}
     */
    createRecipe: async (userId: string, recipeInput: CreateRecipeProps, res: Response): Promise<void> => {

        const [ingredients, kitchenUtils] = await Promise.all([
            getUserIngredientsByTypeDB(userId, 'food'),
            getKitchenUtilsDB(userId)
        ]);

        // Check if there are enough ingredients to create a recipe
        if (ingredients.length < 4) {
            throw new Error('Not enough ingredients to create a recipe');
        }

        const userIngredients = ingredients.map((ingredient: PartialIngredient) => ingredient.name) as PartialIngredient[];

        // Create a recipe title using OpenAI API
        const recipeTitle = await createRecipeOperations.createRecipeTitleOpenAI(userIngredients, recipeInput.prompt)

        const [base64image] = await Promise.all([

            // Create the recipe image using GetimgAI API
            createRecipeOperations.createImageGetimgAI(recipeTitle, userIngredients),

            // Create the recipe using OpenAI API
            createRecipeOperations.createRecipeOpenAI({ recipeInput, userIngredients, kitchenUtils, recipeTitle, res })
        ]);
        // Compress the image
        const compressedBase64Image = await compressBase64string(base64image as string, 60); //30 KB

        // for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${compressedBase64Image}`;

        return returnStreamData(res, { event: 'image', data: base64DataUrl });
    },

    /**
     * @description This function creates a recipe using OpenAI API and returns a valid JSON
     * @param {object} params - The parameters object
     * @param {CreateRecipeProps} params.recipeInput 
     * @param {string[]} params.userIngredients 
     * @param {KitchenUtils} params.kitchenUtils 
     * @param {string} params.recipeTitle 
     * @param {Response} params.res 
     * @returns {Recipe} recipe
     */
    createRecipeOpenAI: async ({ recipeInput, userIngredients, kitchenUtils, recipeTitle, res }: createRecipeOpenAIProps): Promise<Recipe> => {

        const maxRetries = 3;
        let attempts = 0;
        let isValidJson = false;

        let recipe = null;

        while (attempts < maxRetries && !isValidJson) { // Retry until a valid JSON is generated
            try {
                const completion = await openai.chat.completions.create({
                    messages: [{
                        role: "user",
                        content: createRecipePrompt({
                            ...recipeInput, userIngredients, recipeTitle, kitchenUtils
                        })
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
            throw new Error('No valid JSON response generated');
        }

        returnStreamData(res, { event: 'recipe', data: recipe });
        return recipe
    },

    /**
     * @description This function creates an image using OpenAI API
     * @param {string} recipeTitle
     * @returns {string} valid base64 image
     */
    createImageOpenAI: async (recipeTitle: string, userIngredients: PartialIngredient[]): Promise<string> => {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: createRecipeImagePrompt(recipeTitle, userIngredients),
            n: 1,
            size: "1024x1024",
            quality: 'standard',
            style: 'vivid',
            response_format: 'b64_json',
        });

        const imageBase64Url = response?.data[0].b64_json as string;

        return imageBase64Url;
    },

    /**
     * @description This function creates an image using GetimgAI API
     * @param recipeTitle 
     * @param userIngredients 
     * @returns 
     */
    createImageGetimgAI: async (recipeTitle: string, userIngredients: PartialIngredient[]): Promise<string> => {
        const url = 'https://api.getimg.ai/v1/flux-schnell/text-to-image';
        const headers = {
            Authorization: `Bearer ${env.GETIMGAI_API_KEY}`,
        };

        const { data } = await axios.post(url, {
            prompt: createRecipeImagePrompt(recipeTitle, userIngredients),
        }, { headers });

        return data.image
    },

    createRecipeTitleOpenAI: async (userIngredient: PartialIngredient[], prompt: string) => {
        const maxRetries = 3;
        let attempts = 0;
        let isValidJson = false;

        let title = null;

        while (attempts < maxRetries && !isValidJson) { // Retry until a valid JSON is generated
            try {
                const completion = await openai.chat.completions.create({
                    messages: [{
                        role: "user",
                        content: createRecipeTitlePrompt(userIngredient, prompt)
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
            throw new Error('No valid JSON response generated');
        }

        return title
    }
}

export default createRecipeOperations