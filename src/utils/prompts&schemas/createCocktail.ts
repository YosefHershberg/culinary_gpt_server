import { Type, type SchemaUnion } from "@google/genai";

// Create cocktail -------------------------------------------

export const createCocktailSchema: SchemaUnion = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: 'Cocktail title',
            nullable: false,
            minLength: '1',
            maxLength: '50'
        },
        description: {
            type: Type.STRING,
            description: 'Cocktail description',
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
            minItems: '2',
            maxItems: '5'
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
                        description: 'Time to complete step',
                        nullable: false,
                        minLength: '1'
                    }
                },
                required: ['step', 'time'],
            },
            minItems: '1'
        },
        level: {
            type: Type.STRING,
            description: 'Difficulty level',
            enum: ['easy', 'medium', 'hard'],
            nullable: false
        },
        time: {
            type: Type.STRING,
            description: 'Total preparation time',
            nullable: false,
            minLength: '1'
        },
        type: {
            type: Type.STRING,
            description: 'Must be "cocktail"',
            enum: ['cocktail'],
            nullable: false
        }
    },
    required: ['title', 'description', 'ingredients', 'steps', 'level', 'time', 'type'],
}

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
    `;
};

// create cocktail image ---------------------------------------------------

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

// create cocktail title ---------------------------------------------------

export const createTitleSchema: SchemaUnion = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: 'Creative cocktail title',
            nullable: false,
            minLength: '1',
            maxLength: '50'
        }
    },
    required: ['title'],
}

export const createCocktailTitlePrompt = (
    userIngredients: string[],
    prompt: string
): string => {
    const ingredientsList = userIngredients?.join(', ') || 'available ingredients';
    
    return `
        Generate a cocktail name based on these ingredients: ${ingredientsList}.  
        The title should reference a well-known classic cocktail if possible, or creatively adapt one.  

        **Rules:**  
        1. **Classic First:** Prefer established cocktail names (e.g., "Margarita," "Old Fashioned," "Mojito").  
        2. **Adapt if Needed:** If no exact match exists, modify a classic (e.g., "Spicy Ginger Margarita").  
        3. **Character-Driven:** The name should reflect the cocktail’s flavor profile (e.g., "Smoky," "Tropical," "Citrus-Forward").  
        4. **Brevity:** Aim for 1-4 words unless a longer name is iconic (e.g., "Espresso Martini").  
        5. **Additional Context:** Consider: ${prompt}.  

        **Examples:**  
        - With lime, tequila, triple sec → **"Margarita"**  
        - With rum, mint, lime, soda → **"Mojito"**  
        - With vodka, coffee liqueur → **"Espresso Martini"**  
        - With bourbon, lemon, honey → **"Whiskey Sour"**  
        - With gin, cucumber, elderflower → **"Cucumber Elderflower Gin Fizz"**  
    `;
};
