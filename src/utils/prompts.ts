import { CreateRecipeProps } from "../api/services/createRecipe.service"
import { type KitchenUtils } from "../types"

type CreateRecipePromptProps = CreateRecipeProps & {
    userIngredients: string[];
    recipeTitle: string;
    kitchenUtils: KitchenUtils;
}

export const createRecipePrompt = ({
    mealSelected,
    selectedTime,
    userIngredients,
    recipeTitle,
    kitchenUtils,
    numOfPeople,
    prompt,
}: CreateRecipePromptProps): string => {
    return `
        Create a recipe for a ${recipeTitle} that is suitable for ${mealSelected}. The recipe should take no more than ${selectedTime} minutes to prepare and cook.
        
        Available ingredients: ${userIngredients?.join(', ')}.
        Available kitchen utilities: ${kitchenUtils}.
        The recipe should serve ${numOfPeople} people.
        
        Additional instructions: ${prompt}.
        
        **Very Important Rules:**
        1. Do not use any ingredients that are not listed in the available ingredients.
        2. Do not use any kitchen utensils that are not listed in the available kitchen utilities.
        3. The response must be a valid JSON object without any backticks or additional text.
        4. The JSON structure must strictly follow the format below:
        
        {
            "title": "Recipe title",
            "description": "Recipe description (no more than 120 characters)",
            "ingredients": [
                {
                    "ingredient": "ingredient name and quantity"
                }
            ],
            "steps": [
                {
                    "step": "step description",
                    "time": "time to complete the step"
                }
            ],
            "time": "total time to complete the recipe",
            "level": "difficulty level of the recipe (easy, medium, hard)",
            "type": "recipe"
        }
        
        **NOTE:** The JSON object must be valid and should not contain any additional text, explanations, or backticks.

        **Response Format:**
        - Only the JSON object as described above. Do not include any additional text, explanations, or backticks.
    `;
};

export const createRecipeImagePrompt = (
    recipeTitle: string,
) => {
    return `
        A hyper-realistic and beautifully styled photo of a freshly prepared ${recipeTitle}.

        **Key Details:**
        - Do not show any raw ingredients in the image—only the final plated dish.
        - Ensure the dish looks like it was prepared in a high-end restaurant, with professional plating and presentation.
        - Use natural lighting to highlight the textures and vibrant colors of the food.
        - Include soft shadows to add depth and realism.
        - The background should be subtly blurred and complement the dish, such as a clean modern kitchen or a rustic wooden table.
        - Make the dish look appetizing, fresh, and visually stunning, as if captured by a professional food photographer.
        
        **Important Rules:**
        1. Do not include any ingredients that are not in the provided list.
        2. Focus solely on the final dish—no raw ingredients, utensils, or distractions.
        3. The image should evoke a sense of elegance and simplicity, with a strong emphasis on the dish itself.
    `;
};

export const createRecipeTitlePrompt = (
    userIngredients: string[],
    prompt: string,
    kitchenUtils: KitchenUtils
) => {
    return `
        Create a catchy and descriptive recipe title using the following ingredients: ${userIngredients?.join(', ')}.
        The recipe should be made using the following kitchen utilities: ${kitchenUtils}.
        
        **Rules:**
        1. The title should not exceed 7 words.
        2. If possible, provide the title of an existing dish that matches the ingredients.
        3. You do not need to use all the ingredients in the title.
        4. Take into account this additional prompt: ${prompt}.
        
        **Very Important:**
        - The response must be a valid JSON object without any backticks or additional text.
        - The JSON structure must strictly follow the format below:
        
        {
            "title": "Recipe title"
        }
        
        **NOTE:** The JSON object must be valid and should not contain any additional text, explanations, or backticks. If a title cannot be created with the given constraints, return an empty JSON object: {}.

        **Response Format:** 
        - Only the JSON object as described above. Do not include any additional text, explanations, or backticks.

    `;
};

export const createCocktailPrompt = (
    userIngredients: string[],
    prompt: string,
    title: string
) => {
    return `
        Create a ${title} cocktail recipe using the following ingredients: ${userIngredients?.join(', ')}.
        
        **Rules:**
        1. Use only the provided ingredients.
        2. Do not use more than 5 ingredients.
        3. Take into account this additional prompt: ${prompt}.
        
        **Very Important:**
        - The response must be a valid JSON object without any backticks, additional text, or explanations.
        - The JSON structure must strictly follow the format below:
        
        {
            "title": "Cocktail title",
            "description": "Cocktail description (no more than 120 characters)",
            "ingredients": [
                {
                    "ingredient": "ingredient name and quantity"
                }
            ],
            "steps": [
                {
                    "step": "step description",
                    "time": "time to complete the step"
                }
            ],
            "level": "difficulty level (easy, medium, hard)",
            "time": "total time to prepare the cocktail",
            "type": "cocktail"
        }
        
        **NOTE:** If a cocktail recipe cannot be created with the given constraints, return an empty JSON object: {}.
        
        **Response Format:** 
        - Only the JSON object as described above. Do not include any additional text, explanations, or backticks.
    `;
};

export const createCocktailImagePrompt = (
    cocktailTitle: string,
) => {
    return `
        A hyper-realistic photograph of a beautifully presented ${cocktailTitle} cocktail.
        
        **Key Details:**
        - Do not show any raw ingredients in the image—only the final cocktail in a glass.
        - The drink should appear professionally crafted, with vibrant, natural colors and a fresh, inviting look.
        - Use a fitting glass (e.g., martini glass, highball glass, or coupe) that complements the cocktail's style.
        - Include subtle reflections and condensation on the glass to enhance realism.
        - Use soft natural or studio lighting to highlight the drink's textures, colors, and depth.
        - The background should be a modern or elegant bar setting, subtly blurred to keep the focus on the cocktail.
        - Exclude any visible raw ingredients, utensils, or text—only the cocktail itself, as if photographed by a professional food photographer.
        
        **Important Rules:**
        1. Do not include any ingredients that are not in the provided list.
        2. Focus solely on the final cocktail—no raw ingredients, tools, or distractions.
        3. The image should evoke a sense of sophistication and freshness, with a strong emphasis on the drink itself.
    `;
};

export const createCocktailTitlePrompt = (
    userIngredients: string[],
    prompt: string
) => {
    return `
        Create a creative and engaging cocktail title using the following ingredients: ${userIngredients?.join(', ')}.
        
        **Rules:**
        1. The title should reflect the character of the cocktail.
        2. If possible, provide the title of an existing cocktail that matches the ingredients.
        3. You do not need to use all the ingredients in the title.
        4. Take into account this additional prompt: ${prompt}.
        
        **Very Important:**
        - The response must be a valid JSON object without any backticks, additional text, or explanations.
        - The JSON structure must strictly follow the format below:
        
        {
            "title": "Cocktail title"
        }
        
        **NOTE:** If a title cannot be created with the given constraints, return an empty JSON object: {}.
        
        **Response Format:** 
        - Only the JSON object as described above. Do not include any additional text, explanations, or backticks.
    `;
};