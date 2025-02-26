import axios from 'axios';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';

import { getUserIngredientsByTypeDB } from "../data-access/userIngredient.da";
import { getKitchenUtilsDB } from '../data-access/kitchenUtils.da';

import openai from '../../config/openai';
import env from '../../utils/env';
import logger from '../../config/logger';

import { compressBase64string, isValidJSON, returnStreamData } from "../../utils/helperFunctions";
import { createRecipeImagePrompt, createRecipePrompt, createRecipeTitlePrompt } from '../../utils/prompts';
import { UserIngredient, Recipe } from "../../interfaces";

export interface CreateRecipeProps {
    mealSelected: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
    selectedTime: number;
    prompt: string;
    numOfPeople: number;
}

const MAX_RETRIES = 3;

/**
 * @module createRecipe.service
 * 
 * @description This module provides operations for creating a recipe
 * @note this service uses server sent events to stream data to the client. therefore, the response object is passed to the functions
 * 
 * @exports createRecipeOperations
 */

const createRecipeOperations = {

    /**
     * @description This function creates a recipe using OpenAI API and returns a valid JSON
     * @note We create the title first and then the recipe and image simultaneously. This way is faster.
     * @param {string} userId
     * @param {CreateRecipeProps} recipeInput
     * @param {Response} res
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

        const userIngredients = ingredients.map((ingredient: UserIngredient) => ingredient.name);

        const recipeTitlePrompt = createRecipeTitlePrompt(userIngredients, recipeInput.prompt, kitchenUtils);

        // Create a recipe title using OpenAI API
        const recipeTitle = await createRecipeOperations.createRecipeTitleOpenAI(recipeTitlePrompt);

        const imagePrompt = createRecipeImagePrompt(recipeTitle);
        const recipePrompt = createRecipePrompt({ ...recipeInput, userIngredients, recipeTitle, kitchenUtils });

        const [base64image] = await Promise.all([

            // Create the recipe image using GetimgAI API
            createRecipeOperations.createImageGetimgAI(imagePrompt),

            // Create the recipe using OpenAI API & stream it to client
            createRecipeOperations.createRecipeOpenAI(recipePrompt, res)
        ]);

        // Compress the image
        const compressedBase64Image = await compressBase64string(base64image as string, 60); //30 KB

        // for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${compressedBase64Image}`;

        // Stream the image to the client
        return returnStreamData(res, { event: 'image', payload: base64DataUrl });
    },

    /**
     * @description This function creates a recipe using OpenAI API and returns a valid JSON
     * @param {string} recipePrompt
     * @param {Response} res
     * @returns {Recipe} recipe
     */
    createRecipeOpenAI: async (recipePrompt: string, res: Response): Promise<Recipe> => {
        let attempts = 0;
        let isValidJson = false;

        let recipe = null;

        while (attempts < MAX_RETRIES && !isValidJson) { // Retry until a valid JSON is generated
            try {
                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: "You are a professional chef. Your responses must always be a valid JSON object without any additional text or explanations." },
                        { role: "user", content: recipePrompt },
                    ],
                    model: "gpt-3.5-turbo",
                });

                const response = completion.choices[0].message.content as string;

                isValidJson = isValidJSON(response);

                if (isValidJson) {
                    recipe = JSON.parse(response);
                    // This is relevant for deleting the recipe
                    recipe.id = uuid();
                }
            } catch (error) {
                logger.error(error);
            } finally {
                attempts++;
            }
        }

        if (!isValidJson) {
            throw new Error('No valid JSON response generated');
        }


        returnStreamData(res, { event: 'recipe', payload: recipe });
        return recipe
    },

    /**
     * @description This function creates an image using GetimgAI API
     * @param {string} imagePrompt
     * @returns {string} base64 image
     */
    // createImageGetimgAI: async (imagePrompt: string): Promise<string> => {
    createImageGetimgAI: async (imagePrompt: string): Promise<any> => {
        const url = 'https://api.getimg.ai/v1/flux-schnell/text-to-image';
        const headers = {
            Authorization: `Bearer ${env.GETIMGAI_API_KEY}`,
        };

        logger.info(imagePrompt);

        try {
            const { data } = await axios.post(url, {
                prompt: imagePrompt,
            }, { headers });
            return data.image
        } catch (error) {
            logger.error(error);
        }
    },

    /**
     * @description This function creates a recipe title using OpenAI API and returns a valid JSON
     * @param {string} recipeTitlePrompt
     * @returns {string} title
     */
    createRecipeTitleOpenAI: async (recipeTitlePrompt: string) => {
        let attempts = 0;
        let isValidJson = false;

        let title = null;

        while (attempts < MAX_RETRIES && !isValidJson) { // Retry until a valid JSON is generated
            try {
                const completion = await openai.chat.completions.create({
                    messages: [{
                        role: "user",
                        content: recipeTitlePrompt
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
            throw new Error('No valid JSON response generated');
        }

        logger.info(`Recipe title: ${title}`);
        return title
    }
}

export default createRecipeOperations