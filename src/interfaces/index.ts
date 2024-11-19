/**
 * @fileoverview Interfaces for the application
 */

export interface UserIngredientResponse {
    category: string[];
    popularity: number;
    type: IngredientType[];        
    name: string;
    id: string;
}

/**
 * @note This is 
 */
export type PartialUserIngredientResponse = Partial<UserIngredientResponse>

export interface KitchenUtils {
    "Stove Top": boolean,
    "Oven": boolean,
    "Microwave": boolean,
    "Air Fryer": boolean,
    "Blender": boolean,
    "Food Processor": boolean,
    "Slow Cooker": boolean,
    "BBQ": boolean,
    "Grill": boolean,
}

export interface RecipeWithImage {
    image_url: string;
    recipe: Recipe;
}

export interface Recipe {
    title: string;
    description: string;
    ingredients: {
        ingredient: string;
    }[];
    steps: {
        step: string;
        time: string;
    }[];
    time: string;
    level: string;
    type: "recipe" | "cocktail";
}

export type IngredientType = "food" | "drink";


