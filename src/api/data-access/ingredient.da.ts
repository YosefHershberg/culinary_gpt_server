import prisma from "../../config/prisma";
import type { IngredientModel } from "../../generated/prisma/models";
import type { IngredientType } from "../../types";

export const getIngredientsByCategoryDB = async (category: string): Promise<IngredientModel[]> => {
    return prisma.ingredient.findMany({
        where: { category: { has: category } },
    });
}

export const searchIngredientsByQueryAndTypeDB = async (
    query: string,
    type: IngredientType
): Promise<IngredientModel[]> => {
    return prisma.ingredient.findMany({
        where: {
            name: { contains: query, mode: 'insensitive' },
            type: { has: type },
        },
    });
}

export const getManyIngredientsByLabelsDB = async (labels: string[]): Promise<IngredientModel[]> => {
    return prisma.ingredient.findMany({
        where: { name: { in: labels } },
    });
}
