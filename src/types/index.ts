/**
 * @file index.ts
 * @description Exports all application types.
 * @module types
 * @note The single source of truth for DB model types is the Prisma schema.
 *       Import model types (UserModel, RecipeModel, etc.) from '../generated/prisma/models'.
 */

export * from './http.types';
export * from './service.types';

/**
 * The shape of a recipe as returned by the AI (Gemini).
 * This is the content before it's saved to the database.
 */
export type RecipeContent = {
    title: string;
    description: string;
    ingredients: { ingredient: string }[];
    steps: { step: string; time: string }[];
    time: string;
    level: string;
    type: 'recipe' | 'cocktail';
    id: string;
};

export type RecipeWithImage = {
    image_url: string;
    recipe: RecipeContent;
    userId: string;
    createdAt?: Date;
    id?: string;
};

export type IngredientType = "food" | "drink";

export type UserIngredientResponse = { id: string; name: string; type: string[] };
