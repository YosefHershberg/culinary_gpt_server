import { CreateRecipeProps } from "../api/services/createRecipe.service"
import { KitchenUtils } from "../interfaces"
import { PartialUserIngredientResponse as PartialIngredient } from "../interfaces"

interface CreateRecipePromptProps extends CreateRecipeProps {
    userIngredients: PartialIngredient[];
    recipeTitle: string;
    kitchenUtils: KitchenUtils;
}

export const createRecipePrompt = ({ mealSelected, selectedTime, userIngredients, recipeTitle, kitchenUtils, numOfPeople, prompt }: CreateRecipePromptProps) => {
    return `create a recipe of a ${recipeTitle} for ${mealSelected} that takes ${selectedTime} minutes
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
        NOTE: the json i want you to generate must be a valid json object and without the backticks
    `
}

export const createRecipeImagePrompt = (recipeTitle: string, userIngredients: PartialIngredient[]) => {
    return `A hyper-realistic and beautifully styled photo of a freshly prepared ${recipeTitle}. 
        made with these ingredients: ${userIngredients?.join(', ')}.
        Don't show the ingredients in the image. just the dish!
        The dish should look professionally plated and served in an elegant yet simple style. 
        Use natural lighting with soft shadows to bring out the textures and vibrant colors of the food.
        The background should be subtly blurred and complement the dish, like a clean, modern kitchen or rustic wooden table. 
        Do not display raw ingredients—focus only on the final plated dish, making it look appetizing and fresh, 
        as if captured by a professional food photographer.
    `
}

export const createCocktailPrompt = (userIngredients: PartialIngredient[], prompt: string, title: string) => {
    return `Create a ${title} cocktail recipe with these ingredients: ${userIngredients?.join(', ')}
        Also, consider this prompt: ${prompt}.
        Important: Use only the provided ingredients.
        Don't use more than 5 ingredients.
        Format in valid JSON without backticks:
        {
            "title": "Cocktail title",
            "description": "Cocktail description",
            "ingredients": [{"ingredient": "ingredient name and quantity"}],
            "steps": [{"step": "step description", "time": "time to complete"}],
            "level": "difficulty level",
            "time": "total time",
            "type": "cocktail" (exactly like this)
        }
    `
}

export const createCocktailImagePrompt = (cocktailTitle: string, userIngredients: PartialIngredient[]) => {
    return `A hyper-realistic photograph of a beautifully presented ${cocktailTitle} cocktail.
        the ingredients are: ${userIngredients?.join(', ')}.
        Don't show the ingredients in the image. just the cocktail!
        The drink should appear professionally crafted and served in a fitting glass, 
        with vibrant, natural colors and subtle reflections to make it look freshly prepared.
        Include visually stunning lighting, such as soft natural or studio lighting, 
        to enhance the textures and depth. The background should complement the drink 
        with a modern or elegant bar setting, but remain blurred to maintain focus 
        on the cocktail. Exclude any visible ingredients or text—just the cocktail itself, 
        as if photographed by a professional food photographer.
    `
}

export const createRecipeTitlePrompt = (userIngredients: PartialIngredient[], prompt: string) => {
    return `Create a recipe title using these ingredients: ${userIngredients?.join(', ')}.
        The title should be catchy and descriptive, capturing the essence of the dish.
        Avoid generic titles and aim for something unique and appealing.
        Important: take in mind this prompt: ${prompt}.
        Format in valid JSON without backticks:
        {
            "title": "Recipe title"
        }
    `
}

export const createCocktailTitlePrompt = (userIngredients: PartialIngredient[], prompt: string) => {
    return `Create a cocktail title using these ingredients: ${userIngredients?.join(', ')}.
        The title should be creative and engaging, reflecting the character of the cocktail.
        Avoid common names and opt for something intriguing and memorable.
        Important: consider this prompt: ${prompt}.
        Format in valid JSON without backticks:
        {
            "title": "Cocktail title"
        }
    `
}