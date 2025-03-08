import { DeleteResult } from "mongodb";
import Recipe from "../models/recipe.model";
import { getUserPageRecipesProps, RecipeWithImage } from "../../types";

export const getRecipesPageDB = async ({
    userId, page, limit, filter, query, sort,
}: getUserPageRecipesProps): Promise<RecipeWithImage[]> => {
    let dbQuery: Record<string, any> = { userId };

    if (filter !== 'all') {
        if (filter === 'recipes') {
            dbQuery['recipe.type'] = 'recipe';
        } else {
            dbQuery['recipe.type'] = 'cocktail';
        }
    }

    if (query) {
        dbQuery['recipe.title'] = { $regex: query, $options: 'i' };
    }

    let sortQuery: Record<string, any> = {};
    switch (sort) {
        case 'newest':
            sortQuery = { createdAt: -1 };
            break;
        case 'oldest':
            sortQuery = { createdAt: 1 };
            break;
        case 'a-z':
            sortQuery = { 'recipe.title': 1 };
            break;
        case 'z-a':
            sortQuery = { 'recipe.title': -1 };
            break;
        default:
            sortQuery = { createdAt: -1 };
            break;
    }

    const recipes = await Recipe.find(dbQuery)
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

    if (!recipes) {
        throw new Error('Recipes not found');
    }

    console.log(recipes[0]);

    return recipes;
};

export const getAllRecipesDB = async (userId: string): Promise<RecipeWithImage[]> => {
    const recipes = await Recipe.find({ userId }).exec();

    if (!recipes) {
        throw new Error('Recipes not found');
    }

    return recipes;
}

export const addRecipeDB = async (recipe: RecipeWithImage): Promise<RecipeWithImage> => {
    const newRecipe = new Recipe(recipe);
    const savedRecipe = await newRecipe.save();
    return savedRecipe;
}

export const getRecipeDB = async (recipeId: string): Promise<RecipeWithImage> => {
    const recipe = await Recipe.findById(recipeId).exec();

    if (!recipe) {
        throw new Error('Recipe not found');
    }

    return recipe;
}

export const deleteRecipeDB = async (recipeId: string): Promise<RecipeWithImage> => {
    const deletedRecipe = await Recipe.findByIdAndDelete(recipeId).exec();

    if (!deletedRecipe) {
        throw new Error('Recipe not found');
    }

    return deletedRecipe;
}

export const deleteUserRecipesDB = async (userId: string): Promise<DeleteResult> => {
    const deletedRecipes = await Recipe.deleteMany({ userId }).exec();
    return deletedRecipes;
}