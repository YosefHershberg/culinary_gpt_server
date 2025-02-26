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
import aiOperations from './ai.service';

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
     * @description This function creates a recipe and returns a valid JSON with image
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

        const { title: recipeTitle } = await aiOperations.openaiCreate<{ title: string }>(recipeTitlePrompt);

        const imagePrompt = createRecipeImagePrompt(recipeTitle);
        const recipePrompt = createRecipePrompt({ ...recipeInput, userIngredients, recipeTitle, kitchenUtils });

        const [base64image] = await Promise.all([
            // Create the recipe image using GetimgAI API
            aiOperations.createImageGetimgAI(imagePrompt),

            // Create the recipe using OpenAI API
            createRecipeOperations.createRecipeService(recipePrompt, res)
        ]);

        // Compress the image
        const compressedBase64Image = await compressBase64string(base64image as string, 60); // 30 KB

        // for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${compressedBase64Image}`;

        return returnStreamData(res, { event: 'image', payload: base64DataUrl });
    },

    /**
     * @description This function creates a recipe using OpenAI API and returns a valid JSON
     * @param {string} recipePrompt
     * @param {Response} res
     * @returns {Recipe} recipe
     */
    createRecipeService: async (recipePrompt: string, res: Response): Promise<void> => {
        let recipe = await aiOperations.openaiCreate<Recipe>(recipePrompt);

        // This is relevant for deleting the recipe
        recipe.id = uuid();

        return returnStreamData(res, { event: 'recipe', payload: recipe });
    },
};

export default createRecipeOperations