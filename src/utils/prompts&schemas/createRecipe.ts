import { Type, SchemaUnion } from "@google/genai";
import { CreateRecipeProps } from "../../api/services/createRecipe.service";
import { KitchenUtils } from "../../types";

// Create recipe -------------------------------------------

export const createRecipeSchema: SchemaUnion = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: 'Recipe title',
            nullable: false,
            minLength: '1'
        },
        description: {
            type: Type.STRING,
            description: 'Recipe description (no more than 120 characters)',
            nullable: false,
            minLength: '1',
            maxLength: '120'
        },
        ingredients: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    ingredient: {
                        type: Type.STRING,
                        description: 'Ingredient name and quantity',
                        nullable: false,
                        minLength: '1'
                    }
                },
                required: ['ingredient'],
            },
            minItems: '1'
        },
        steps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    step: {
                        type: Type.STRING,
                        description: 'Step description',
                        nullable: false,
                        minLength: '1'
                    },
                    time: {
                        type: Type.STRING,
                        description: 'Time to complete the step',
                        nullable: false,
                        minLength: '1'
                    }
                },
                required: ['step', 'time'],
            },
            minItems: '1'
        },
        time: {
            type: Type.STRING,
            description: 'Total time to complete the recipe',
            nullable: false,
            minLength: '1'
        },
        level: {
            type: Type.STRING,
            description: 'Difficulty level of the recipe',
            enum: ['easy', 'medium', 'hard'],
            nullable: false
        },
        type: {
            type: Type.STRING,
            description: 'Recipe type',
            enum: ['recipe'],
            nullable: false
        }
    },
    required: ['title', 'description', 'ingredients', 'steps', 'time', 'level', 'type'],
}

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
    `;
};

// Create recipe image -------------------------------------------

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

// create recipe title ---------------------------------------------------

export const createTitleSchema: SchemaUnion = {
    type: Type.OBJECT,
    properties: {
        'title': {
            type: Type.STRING,
            description: 'Name of the recipe',
            nullable: false,
        },
    },
    required: ['title'],
}

export const createRecipeTitlePrompt = (
    userIngredients: string[],
    prompt: string,
    kitchenUtils: KitchenUtils
) => {
    return `
        Generate an appealing recipe title based on these ingredients: ${userIngredients}
        and kitchen tools: ${kitchenUtils}.

        Requirements:
        1. Maximum 7 words
        2. Prefer existing dish names that match the ingredients
        3. May use a subset of ingredients
        4. Consider additional context: ${prompt}
        5. Prioritize well-known dishes when applicable
        6. Make the title descriptive of the final dish
        7. don't use these words - "Ultimate", "Kitchen", "Sink"

        Examples of good titles:
        - "Creamy Garlic Mushroom Pasta"
        - "Quick Chicken Stir-Fry"
        - "Roasted Vegetable Medley"
    `;
};