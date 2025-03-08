import { FilterQuery } from "mongoose";
import { Ingredient } from "../../types";
import { getIngredientsByCategoryDB, searchIngredientsByQueryAndTypeDB } from "../data-access/ingredient.da";
import { IngredientType } from "../../types";

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