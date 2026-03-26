import prisma from "../../config/prisma";
import type { RecipeModel } from "../../generated/prisma/models";
import type { Prisma } from "../../generated/prisma/client";
import type { GetUserPageRecipesProps, RecipeWithImage } from "../../types";

export const getRecipesPageDB = async ({
    userId, page, limit, filter, query, sort,
}: GetUserPageRecipesProps): Promise<RecipeWithImage[]> => {
    const where: Prisma.RecipeWhereInput = { userId };

    if (filter !== 'all') {
        where.type = filter === 'recipes' ? 'recipe' : 'cocktail';
    }

    if (query) {
        where.title = { contains: query, mode: 'insensitive' };
    }

    let orderBy: Prisma.RecipeOrderByWithRelationInput;
    switch (sort) {
        case 'newest':
            orderBy = { createdAt: 'desc' };
            break;
        case 'oldest':
            orderBy = { createdAt: 'asc' };
            break;
        case 'a-z':
            orderBy = { title: 'asc' };
            break;
        case 'z-a':
            orderBy = { title: 'desc' };
            break;
        default:
            orderBy = { createdAt: 'desc' };
            break;
    }

    const recipes = await prisma.recipe.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
    });

    return recipes.map(toRecipeResponse);
};

export const getAllRecipesDB = async (userId: string): Promise<RecipeWithImage[]> => {
    const recipes = await prisma.recipe.findMany({ where: { userId } });
    return recipes.map(toRecipeResponse);
}

export const addRecipeDB = async (recipe: RecipeWithImage): Promise<RecipeWithImage> => {
    const created = await prisma.recipe.create({
        data: {
            title: recipe.recipe.title,
            description: recipe.recipe.description,
            ingredients: recipe.recipe.ingredients as Prisma.InputJsonValue,
            steps: recipe.recipe.steps as Prisma.InputJsonValue,
            time: recipe.recipe.time,
            level: recipe.recipe.level,
            type: recipe.recipe.type,
            recipeId: recipe.recipe.id,
            imageUrl: recipe.image_url,
            userId: recipe.userId,
        },
    });

    return toRecipeResponse(created);
}

export const getRecipeDB = async (recipeId: string): Promise<RecipeWithImage> => {
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });

    if (!recipe) {
        throw new Error('Recipe not found');
    }

    return toRecipeResponse(recipe);
}

export const deleteRecipeDB = async (recipeId: string): Promise<RecipeWithImage> => {
    const deleted = await prisma.recipe.delete({ where: { id: recipeId } });
    return toRecipeResponse(deleted);
}

export const deleteUserRecipesDB = async (userId: string) => {
    return prisma.recipe.deleteMany({ where: { userId } });
}

function toRecipeResponse(row: RecipeModel): RecipeWithImage {
    return {
        id: row.id,
        image_url: row.imageUrl,
        recipe: {
            title: row.title,
            description: row.description,
            ingredients: row.ingredients as { ingredient: string }[],
            steps: row.steps as { step: string; time: string }[],
            time: row.time,
            level: row.level,
            type: row.type as 'recipe' | 'cocktail',
            id: row.recipeId,
        },
        userId: row.userId,
        createdAt: row.createdAt,
    };
}
