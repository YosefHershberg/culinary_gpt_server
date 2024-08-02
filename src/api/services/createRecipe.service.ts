/**
 * @module createRecipe.service
 * 
 * @description This module provides operations for creating a recipe
 * @exports createRecipeOperations
 */

import openai from '../../config/openai';
import { compressBase64Image, isValidJSON } from "../../utils/helperFunctions";

import { Ingredient, KitchenUtils, Recipe, RecipeWithImage } from "../../interfaces";
import { getUserIngredients } from "../data-access/ingredient.da";
import { getUserDB } from "../data-access/user.da";
import logger from '../../config/logger';

interface CreateRecipeInput {
    mealSelected: string;
    selectedTime: number;
    prompt: string;
    numOfPeople: number;
}

export const createRecipeOperations = {

    /**
     * @description This function creates a recipe using OpenAI API and returns a valid JSON
     * @param {string} userId
     * @param {CreateRecipeInput} recipeInput
     * @returns 
     */
    createRecipe: async (userId: string, recipeInput: CreateRecipeInput): Promise<RecipeWithImage> => {
        let kitchenUtils;
        let userIngredients: string[];

        const [ingredients, user] = await Promise.all([
            getUserIngredients(userId),
            getUserDB(userId)
        ]);

        kitchenUtils = user.kitchenUtils;
        userIngredients = ingredients.map((ingredient: Ingredient) => ingredient.name);

        const recipe = await createRecipeOperations.createRecipeOpenAI(recipeInput, userIngredients, kitchenUtils);

        const imageUrl = await createRecipeOperations.createImageOpenAI(recipe.title)

        const base64Image = await compressBase64Image(imageUrl as string, 60); //30 KB

        // for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${base64Image}`;

        return { recipe, image_url: base64DataUrl };
    },

    /**
     * @description This function creates a recipe using OpenAI API and returns a valid JSON
     * @param {CreateRecipeInput} recipeInput 
     * @param {string[]} userIngredients 
     * @param {KitchenUtils} kitchenUtils 
     * @returns 
     */
    createRecipeOpenAI:
        async (recipeInput: CreateRecipeInput, userIngredients: string[], kitchenUtils: KitchenUtils): Promise<Recipe> => {
            const { mealSelected, selectedTime, prompt, numOfPeople } = recipeInput;

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
                                create a recipe for ${mealSelected} that takes ${selectedTime} minutes
                                the following ingredients are available: ${userIngredients?.join(', ')}
                                with the following kitchen utilities: ${kitchenUtils}
                                the recipe should serve ${numOfPeople} people
                                add also keep in mind this - ${prompt}
                                the response that I want you to give me should be a VALID json that looks like this:
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
                                NOTE: the json i want you to genarate must be a valid json object and without the backticks
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
     * @param {string} recipeTitle
     * @returns
     */
    createImageOpenAI: async (recipeTitle: string): Promise<string> => {
        let imageUrl: string

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `A realistic photo of ${recipeTitle}`,
            n: 1,
            size: "1024x1024",
            response_format: 'b64_json',
        });

        imageUrl = response.data[0].b64_json as string;

        return imageUrl;
    }

}