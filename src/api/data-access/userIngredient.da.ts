import prisma from "../../config/prisma";
import type { UserIngredientModel } from "../../generated/prisma/models";
import type { UserIngredientResponse, IngredientType } from "../../types";

export type RecipeGenerationContext = {
    kitchenUtils: string[];
    ingredientNames: string[];
};

export const addUserIngredientDB = async (userIngredient: Pick<UserIngredientModel, 'userId' | 'ingredientId' | 'name' | 'type'>): Promise<UserIngredientResponse> => {
    const created = await prisma.userIngredient.create({
        data: {
            userId: userIngredient.userId,
            ingredientId: userIngredient.ingredientId,
            name: userIngredient.name,
            type: userIngredient.type,
        },
    });

    return toUserIngredientResponse(created);
}

export const addMultipleUserIngredientsDB = async (userIngredientDocs: Pick<UserIngredientModel, 'userId' | 'ingredientId' | 'name' | 'type'>[]): Promise<UserIngredientResponse[]> => {
    await prisma.userIngredient.createMany({
        data: userIngredientDocs.map(doc => ({
            userId: doc.userId,
            ingredientId: doc.ingredientId,
            name: doc.name,
            type: doc.type,
        })),
    });

    // createMany doesn't return records, so fetch them
    const created = await prisma.userIngredient.findMany({
        where: {
            userId: userIngredientDocs[0].userId,
            ingredientId: { in: userIngredientDocs.map(d => d.ingredientId) },
        },
    });

    return created.map(toUserIngredientResponse);
}

export const deleteUserIngredientDB = async (userId: string, ingredientId: string): Promise<UserIngredientResponse> => {
    const deleted = await prisma.userIngredient.delete({
        where: {
            userId_ingredientId: { userId, ingredientId },
        },
    });

    return toUserIngredientResponse(deleted);
}

export const getUserIngredientsDB = async (userId: string): Promise<UserIngredientResponse[]> => {
    const ingredients = await prisma.userIngredient.findMany({ where: { userId } });
    return ingredients.map(toUserIngredientResponse);
}

export const getUserIngredientsByTypeDB = async (userId: string, type: IngredientType): Promise<UserIngredientResponse[]> => {
    const ingredients = await prisma.userIngredient.findMany({
        where: { userId, type: { has: type } },
    });
    return ingredients.map(toUserIngredientResponse);
}

export const deleteAllUserIngredientsDB = async (userId: string) => {
    return prisma.userIngredient.deleteMany({ where: { userId } });
}

export const getRecipeGenerationContextDB = async (userId: string): Promise<RecipeGenerationContext> => {
    const result = await prisma.$queryRaw<[{ kitchen_utils: string[]; ingredient_names: string[] }]>`
        SELECT
          COALESCE(
            (
              SELECT json_agg(util_name ORDER BY util_name)
              FROM (
                SELECT util_name
                FROM kitchen_utils uk
                CROSS JOIN LATERAL (
                  VALUES
                    ('stove_top', uk.stove_top),
                    ('oven', uk.oven),
                    ('microwave', uk.microwave),
                    ('air_fryer', uk.air_fryer),
                    ('blender', uk.blender),
                    ('food_processor', uk.food_processor),
                    ('slow_cooker', uk.slow_cooker),
                    ('bbq', uk.bbq),
                    ('grill', uk.grill)
                ) AS v(util_name, enabled)
                WHERE uk.user_id = ${userId}
                  AND v.enabled = true
              ) t
            ),
            '[]'::json
          ) AS kitchen_utils,
          COALESCE(
            (
              SELECT json_agg(ui.name ORDER BY ui.name)
              FROM user_ingredients ui
              WHERE ui.user_id = ${userId}
            ),
            '[]'::json
          ) AS ingredient_names
    `;

    const row = result[0];
    return {
        kitchenUtils: row.kitchen_utils ?? [],
        ingredientNames: row.ingredient_names ?? [],
    };
}

function toUserIngredientResponse(row: UserIngredientModel): UserIngredientResponse {
    return {
        id: row.ingredientId,
        name: row.name,
        type: row.type,
    };
}
