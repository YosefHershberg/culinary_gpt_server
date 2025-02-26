import { FilterQuery } from "mongoose";
import { IngredientDocument } from "../models/ingredient.model";
import { getIngredientsByCategoryDB, searchIngredientsByQueryAndTypeDB } from "../data-access/ingredient.da";
import { IngredientType } from "../../interfaces";

/**
 * @module ingredients.service
 * 
 * @description This module provides Services for managing user ingredients
 * @exports ingredientServices
 */

const ingredientServices = {
    getByCategory: async (category: string): Promise<IngredientDocument[]> => {
        const ingredients = await getIngredientsByCategoryDB(category)
        return ingredients
    },

    search: async (
        query: FilterQuery<IngredientDocument>,
        type: IngredientType
    ): Promise<IngredientDocument[]> => {
        const ingredients = await searchIngredientsByQueryAndTypeDB(query, type)
        return ingredients
    },
}

export default ingredientServices