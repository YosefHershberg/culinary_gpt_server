import openai from '../../config/openai';
import { compressBase64Image, isValidJSON } from "../../utils/helperFunctions";

import { UserIngredientResponse, KitchenUtils, Recipe, RecipeWithImage } from "../../interfaces";
import { getUserIngredientsByType } from "../data-access/ingredient.da";
import { getUserDB } from "../data-access/user.da";
import logger from '../../config/logger';

/**
 * @module createRecipe.service
 * 
 * @description This module provides operations for creating a recipe
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
    createRecipe: async (userId: string, recipeInput: CreateRecipeProps): Promise<RecipeWithImage> => {
        let kitchenUtils;
        let userIngredients: string[];

        const [ingredients, user] = await Promise.all([
            getUserIngredientsByType(userId, 'food'),
            getUserDB(userId)
        ]);

        // Check if there are enough ingredients to create a recipe
        if (ingredients.length < 4) {
            throw new Error('Not enough ingredients to create a recipe');
        }

        kitchenUtils = user.kitchenUtils;
        userIngredients = ingredients.map((ingredient: UserIngredientResponse) => ingredient.name);

        // Create a recipe title using OpenAI API
        const title = await createRecipeOperations.createRecipeTitle(recipeInput, userIngredients, kitchenUtils);

        // Create the recipe & the recipe image using OpenAI API
        const [recipe, imageUrl] = await Promise.all([
            createRecipeOperations.createRecipeOpenAI(recipeInput, userIngredients, kitchenUtils, title),
            createRecipeOperations.createImageOpenAI(title, userIngredients)
        ]);

        // Compress the image
        const base64Image = await compressBase64Image(imageUrl as string, 60); //30 KB

        // for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${base64Image}`;


        return { recipe, image_url: base64DataUrl };
    },

    /**
     * @description This function creates a recipe using OpenAI API and returns a valid JSON
     * @param {CreateRecipeProps} recipeInput 
     * @param {string[]} userIngredients 
     * @param {KitchenUtils} kitchenUtils 
     * @returns {Recipe} recipe
     */
    createRecipeOpenAI:
        async (recipeInput: CreateRecipeProps, userIngredients: string[], kitchenUtils: KitchenUtils, title: string): Promise<Recipe> => {
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
                                    "description": "Recipe description",
                                    "ingredients": [{
                                        "ingredient": "ingredient name and quantity",
                                    }],
                                    "steps": [{
                                        "step": "step description",
                                        "time": "time to complete the step"
                                    }],
                                    "time": "total time to complete the recipe",
                                    "level": "difficulty level of the recipe (easy, medium, hard)",
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

            return recipe;
        },

    /**
     * @description This function creates an image using OpenAI API
     * @param {string} recipeTitle
     * @returns {string} valid base64 image
     */
    createImageOpenAI: async (recipeTitle: string, userIngredients: string[]): Promise<string> => {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `A realistic photo of ${recipeTitle} recipe that is made with these ingredients: ${userIngredients.join(', ')}.
                make the image vivid and colorful.
                IMPORTANT: Don't show all the ingredients in the image. Show only a picture of the dish.
                `,
            n: 1,
            size: "1024x1024",
            quality: 'standard',
            style: 'vivid',
            response_format: 'b64_json',
        });

        const imageBase64Url = response.data[0].b64_json as string;

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