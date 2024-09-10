
export interface UserIngredient {
    category?: string[];
    popularity?: number;
    name: string;
    id: string;
}

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
}
