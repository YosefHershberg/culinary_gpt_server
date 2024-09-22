import openai from '../../config/openai';
import { compressBase64Image, isValidJSON } from "../../utils/helperFunctions";

import { UserIngredientResponse, Recipe, RecipeWithImage } from "../../interfaces";
import { getUserIngredientsByType } from "../data-access/ingredient.da";
import logger from '../../config/logger';

/**
 * @module createCocktail.service
 * 
 * @description This module provides operations for creating a cocktail recipe
 * @exports createCocktailOperations
 */

export const createCocktailOperations = {

    /**
     * @description This function creates a recipe using OpenAI API and returns a valid JSON
     * @param {string} userId
     * @param {string} prompt
     * @returns {RecipeWithImage}
     */
    createCocktail: async (userId: string, prompt: string): Promise<RecipeWithImage> => {
        let userIngredients: string[];

        const ingredients = await getUserIngredientsByType(userId, 'drink')

        // Check if there are enough ingredients to create a recipe
        if (ingredients.length < 4) {
            throw new Error('Not enough ingredients to create a recipe');
        }

        userIngredients = ingredients.map((ingredient: UserIngredientResponse) => ingredient.name);

        // Create a recipe title using OpenAI API
        const title = await createCocktailOperations.createCocktailTitle(prompt, userIngredients);

        // Create the recipe & the recipe image using OpenAI API
        const [recipe, imageUrl] = await Promise.all([
            createCocktailOperations.createCocktailOpenAI(prompt, userIngredients, title),
            createCocktailOperations.createImageOpenAI(title, userIngredients)
        ]);

        // Compress the image
        const base64Image = await compressBase64Image(imageUrl as string, 60); //30 KB

        // for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${base64Image}`;

        return { recipe, image_url: base64DataUrl };
    },

    /**
     * @description This function creates a recipe using OpenAI API and returns a valid JSON
     * @param {string[]} userIngredients 
     * @returns {Recipe} recipe
     */
    createCocktailOpenAI:
        async (prompt: string, userIngredients: string[], title: string): Promise<Recipe> => {

            const maxRetries = 3;
            let attempts = 0;
            let isValidJson = false;

            let recipe = null;

            while (attempts < maxRetries && !isValidJson) { // Retry until a valid JSON is generated
                try {
                    const completion = await openai.chat.completions.create({
                        messages: [
                            {
                                role: "user",
                                content: `
                                    create a ${title} cocktail recipe with the following ingredients: ${userIngredients?.join(', ')}
                                    add also keep in mind this - ${prompt}.
                                    Very Important: don't use ingredients that are not available in the list of ingredients provided.
                                    Very Important: don't use kitchen utensils that aren't available in hte data I gave you.
                                    Very Important: make it easy and simple. use around 5 ingredients. don't use more then 7 ingredients.
                                    Very Important: use ml. not oz. for the measurements.
                                    DON'T FORGET:
                                    the response that I want you to give me should be a VALID json without the backticks that looks like this:
                                    {
                                        "title": "Cocktail title",
                                        "description": "Cocktail description",
                                        "ingredients": [{
                                            "ingredient": "ingredient name and quantity",
                                        }],
                                        "steps": [{
                                            "step": "step description",
                                            "time": "time to complete the step"
                                        }],
                                        "level": "difficulty level of the recipe (easy, medium, hard)",
                                        "time": "total time to complete the recipe"
                                    }
                                    NOTE: the json i want you to generate must be a valid json object and without the backticks
                                `
                            }
                        ],
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
     * @param {string} cocktailTitle
     * @param {string[]} userIngredients
     * @returns {string} valid base64 image
     */
    createImageOpenAI: async (cocktailTitle: string, userIngredients: string[]): Promise<string> => {
        let imageUrl: string

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `A realistic photo of ${cocktailTitle} cocktail`,
            n: 1,
            size: "1024x1024",
            quality: 'standard',
            style: 'vivid',
            response_format: 'b64_json',
        });

        imageUrl = response.data[0].b64_json as string;

        return imageUrl;
    },

    /**
     * @description This function creates a cocktail title using OpenAI API
     * @param prompt 
     * @param userIngredients
     * @returns {string} cocktailTitle
     */
    createCocktailTitle: async (prompt: string, userIngredients: string[]): Promise<string> => {

        const maxRetries = 3;
        let attempts = 0;
        let isValidJson = false;

        let cocktailTitle = null;

        while (attempts < maxRetries && !isValidJson) { // Retry until a valid JSON is generated
            try {
                const completion = await openai.chat.completions.create({
                    messages: [
                        {
                            role: "user",
                            content: `
                                create a title for a cocktail. the following ingredients are available: ${userIngredients?.join(', ')}
                                add also keep in mind this - ${prompt}.
                                Very Important: make it easy and simple. use around 5 ingredients. don't use more then 7 ingredients.
                                DON'T FORGET:
                                the response that I want you to give me should be a VALID json without the backticks that looks like this:
                                {
                                    "title": "Recipe title",
                                }
                                NOTE: the json i want you to generate must be a valid json object and without the backticks
                            `
                        }
                    ],
                    model: "gpt-3.5-turbo",
                });

                const response = completion.choices[0].message.content as string;

                isValidJson = isValidJSON(response);

                if (isValidJson) {
                    cocktailTitle = JSON.parse(response).title;
                }
            } catch (error: any) {
                logger.error(error.message);
                attempts++;
            }
        }

        if (!isValidJson) {
            throw new Error('No valid JSON response generated');
        }

        return cocktailTitle;
    }
}