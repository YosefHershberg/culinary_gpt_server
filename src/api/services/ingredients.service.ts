import { getIngredientsByCategoryDB, searchIngredientsByQueryAndTypeDB } from "../data-access/ingredient.da";
import { type Ingredient, type IngredientType } from "../../types";
import { type FilterQuery } from "mongoose";

/**
 * @module ingredients.service
 * 
 * @description This module provides Services for managing user ingredients
 * @exports ingredientServices
 */

const ingredientServices = {
    getByCategory: async (category: string): Promise<Ingredient[]> => {
        const ingredients = await getIngredientsByCategoryDB(category)
        return ingredients
    },

    search: async (
        query: FilterQuery<Ingredient>,
        type: IngredientType
    ): Promise<Ingredient[]> => {
        const ingredients = await searchIngredientsByQueryAndTypeDB(query, type)
        return ingredients
    },
}

export default ingredientServices