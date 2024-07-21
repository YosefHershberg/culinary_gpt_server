import { Ingredient, KitchenUtils, Recipe } from "../../interfaces";
import { getUserWithIngredientsDB } from "../data-access/user.da";
import openai from '../../utils/openai';
import { compressBase64Image, isValidJSON } from "../../utils/helperFunctions";

interface createRecipeInput {
    mealSelected: string;
    selectedTime: number;
    prompt: string;
    numOfPeople: number;
}

export const createRecipeOperations = {
    createRecipe: async (userId: string, recipeInput: createRecipeInput) => {
        let kithchenUtils;
        let userIngredients;

        try {
            const user = await getUserWithIngredientsDB(userId)

            if (!user) {
                throw new Error('User not found')
            }

            kithchenUtils = user.kitchenUtils;
            userIngredients = user.ingredients.map((ingredient: any) => ingredient.name);

        } catch (error: any) {
            console.log(error.message);
            throw new Error('Error accoured fetching user from DB')
        }

        const recipe = await createRecipeOperations.createRecipeOpenAI(recipeInput, userIngredients, kithchenUtils) as Recipe;

        const imageUrl = await createRecipeOperations.createImageOpenAI(recipe.title);

        const base64Image = await compressBase64Image(imageUrl as string, 30); //13 KB

        // for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${base64Image}`;

        return { recipe, image_url: base64DataUrl };
    },

    createRecipeOpenAI: async (recipeInput: createRecipeInput, userIngredients: Ingredient[], kithchenUtils: KitchenUtils) => {
        const { mealSelected, selectedTime, prompt, numOfPeople } = recipeInput;

        const maxRetries = 3;
        let attempts = 0;
        let isValidJson = false;

        let recipe: Recipe | null = null;

        while (attempts < maxRetries && !isValidJson) { // Retry until a valid JSON is generated
            try {
                const completion = await openai.chat.completions.create({
                    messages: [
                        {
                            role: "user", 
                            content: `
                                create a recipe for ${mealSelected} that takes ${selectedTime} minutes
                                the following ingredients are available: ${userIngredients?.join(', ')}
                                with the following kitchen utilities: ${kithchenUtils}
                                the recipe should serve ${numOfPeople} people
                                add also keep in mind this - ${prompt}
                                the response that I want you to give me should VALID json that looks like this:
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
                console.log(error.message);
                attempts++;
            }
        }

        if (!isValidJson) {
            throw new Error('No valid JSON response generated');
        }

        return recipe;
    },

    createImageOpenAI: async (recipeTitle: string) => {
        let imageUrl

        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: `A realistic photo of ${recipeTitle}`,
                n: 1,
                size: "1024x1024",
                response_format: 'b64_json',
            });
            imageUrl = response.data[0].b64_json;
        } catch (error) {
            console.log(error);
            throw new Error('Error accoured while generating the image');
        }

        return imageUrl;
    }

}