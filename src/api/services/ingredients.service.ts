import { getIngredientsByCategoryDB, searchIngredientsByQueryAndTypeDB } from "../data-access/ingredient.da";
import type { IngredientModel } from "../../generated/prisma/models";
import type { IngredientType } from "../../types";

/**
 * @module ingredients.service
 * 
 * @description This module provides Services for managing user ingredients
 * @exports ingredientServices
 */

const ingredientServices = {
    getByCategory: async (category: string): Promise<IngredientModel[]> => {
        const ingredients = await getIngredientsByCategoryDB(category)
        return ingredients
    },

    search: async (
        query: string,
        type: IngredientType
    ): Promise<IngredientModel[]> => {
        const ingredients = await searchIngredientsByQueryAndTypeDB(query, type)
        return ingredients
    },
}

export default ingredientServices