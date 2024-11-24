import fs from 'fs';
import openai from '../../config/openai';
import { compressBase64Image, isValidJSON, returnStreamData } from "../../utils/helperFunctions";

import { PartialUserIngredientResponse as PartialIngredient, KitchenUtils } from "../../interfaces";
import { getUserIngredientsByType } from "../data-access/ingredient.da";
import logger from '../../config/logger';
import { Response } from 'express';
import { getKitchenUtilsDB } from '../data-access/kitchenUtils.da';

/**
 * @module createRecipe.service
 * 
 * @description This module provides operations for creating a recipe
 * @note this service uses server sent events to stream data to the client. therefore, the response object is passed to the functions
 * 
 * @exports createRecipeOperations
 */

interface CreateRecipeProps {
    mealSelected: string;
    selectedTime: number;
    prompt: string;
    numOfPeople: number;
}

export const createRecipeOperations = {

    /**
     * @description This function creates a recipe using OpenAI API and returns a valid JSON
     * @note We create the title first and then the recipe and image simultaneously. This way is faster.
     * @param {string} userId
     * @param {CreateRecipeProps} recipeInput
     * @returns {RecipeWithImage}
     */
    createRecipe: async (userId: string, recipeInput: CreateRecipeProps, res: Response): Promise<void> => {

        const [ingredients, kitchenUtils] = await Promise.all([
            getUserIngredientsByType(userId, 'food'),
            getKitchenUtilsDB(userId)
        ]);

        // Check if there are enough ingredients to create a recipe
        if (ingredients.length < 4) {
            throw new Error('Not enough ingredients to create a recipe');
        }

        const userIngredients = ingredients.map((ingredient: PartialIngredient) => ingredient.name) as string[];

        // Create a recipe title using OpenAI API
        const title = await createRecipeOperations.createRecipeTitle(recipeInput, userIngredients, kitchenUtils);

        // Create the recipe & the recipe image using OpenAI API
        const [_recipe, imageUrl] = await Promise.all([
            createRecipeOperations.createRecipeOpenAI(recipeInput, userIngredients, kitchenUtils, title, res),
            createRecipeOperations.createImageOpenAI(title, userIngredients)
        ]);

        // Compress the image
        const base64Image = await compressBase64Image(imageUrl as string, 60); //30 KB

        // for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${base64Image}`;

        return returnStreamData(res, { event: 'image', data: base64DataUrl });
    },

    /**
     * @description This function creates a recipe using OpenAI API and returns a valid JSON
     * @param {CreateRecipeProps} recipeInput 
     * @param {string[]} userIngredients 
     * @param {KitchenUtils} kitchenUtils 
     * @returns {Recipe} recipe
     */
    createRecipeOpenAI:
        async (recipeInput: CreateRecipeProps, userIngredients: string[], kitchenUtils: KitchenUtils, title: string, res: Response): Promise<void> => {
            const { mealSelected, selectedTime, prompt, numOfPeople } = recipeInput;

            const maxRetries = 3;
            let attempts = 0;
            let isValidJson = false;

            let recipe = null;

            while (attempts < maxRetries && !isValidJson) { // Retry until a valid JSON is generated
                try {
                    const completion = await openai.chat.completions.create({
                        messages: [{
                            role: "user",
                            content: `
                                create a ${title} recipe for ${mealSelected} that takes ${selectedTime} minutes
                                the following ingredients are available: ${userIngredients?.join(', ')}
                                with the following kitchen utilities: ${kitchenUtils}
                                the recipe should serve ${numOfPeople} people.
                                add also keep in mind this - ${prompt}.
                                Very Important: don't use ingredients that are not available in the list of ingredients provided.
                                Very Important: don't use kitchen utensils that aren't available in hte data I gave you.
                                DON'T FORGET:
                                the response that I want you to give me should be a VALID json without the backticks that looks like this:
                                {
                                    "title": "Recipe title",
                                    "description": "Recipe description" (no more than 120 characters),
                                    "ingredients": [{
                                        "ingredient": "ingredient name and quantity",
                                    }],
                                    "steps": [{
                                        "step": "step description",
                                        "time": "time to complete the step"
                                    }],
                                    "time": "total time to complete the recipe",
                                    "level": "difficulty level of the recipe (easy, medium, hard)",
                                    "type": "recipe" (exactly like this)
                                }
                                NOTE: the json i want you to generate must be a valid json object and without the backticks`
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

            return returnStreamData(res, { event: 'recipe', data: recipe });
        },

    /**
     * @description This function creates an image using OpenAI API
     * @param {string} recipeTitle
     * @returns {string} valid base64 image
     */
    createImageOpenAI: async (recipeTitle: string, userIngredients: string[]): Promise<string> => {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `A hyper-realistic and beautifully styled photo of a freshly prepared ${recipeTitle}. 
                made with these ingredients: ${userIngredients?.join(', ')}.
                Don't show the ingredients in the image. just the dish!
                The dish should look professionally plated and served in an elegant yet simple style. 
                Use natural lighting with soft shadows to bring out the textures and vibrant colors of the food.
                The background should be subtly blurred and complement the dish, like a clean, modern kitchen or rustic wooden table. 
                Do not display raw ingredients—focus only on the final plated dish, making it look appetizing and fresh, 
                as if captured by a professional food photographer.`,
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
     * @description This function creates a recipe title using OpenAI API
     * @param recipeInput 
     * @param userIngredients 
     * @param kitchenUtils 
     * @returns {string}
     */
    createRecipeTitle: async (recipeInput: CreateRecipeProps, userIngredients: string[], kitchenUtils: KitchenUtils): Promise<string> => {
        const { mealSelected, selectedTime, prompt } = recipeInput;

        const maxRetries = 3;
        let attempts = 0;
        let isValidJson = false;

        let recipeTitle = null;

        while (attempts < maxRetries && !isValidJson) { // Retry until a valid JSON is generated
            try {
                const completion = await openai.chat.completions.create({
                    messages: [{
                        role: "user",
                        content: `
                            create a title for a recipe recipe for ${mealSelected} that takes ${selectedTime} minutes
                            the following ingredients are available: ${userIngredients?.join(', ')}
                            with the following kitchen utilities: ${kitchenUtils}
                            add also keep in mind this - ${prompt}.
                            have the title be of a dish or similar to a dish that already exists.
                            have the title be no more than 43 characters.
                            DON'T FORGET:
                            the response that I want you to give me should be a VALID json without the backticks that looks like this:
                            {
                                "title": "Recipe title",
                            }
                            NOTE: the json i want you to generate must be a valid json object and without the backticks`
                    }],
                    model: "gpt-3.5-turbo",
                });

                const response = completion.choices[0].message.content as string;

                isValidJson = isValidJSON(response);

                if (isValidJson) {
                    recipeTitle = JSON.parse(response).title;
                }
            } catch (error: any) {
                logger.error(error.message);
                attempts++;
            }
        }

        if (!isValidJson) {
            throw new Error('No valid JSON response generated');
        }

        return recipeTitle;
    }
}