import { FilterQuery } from "mongoose";

import { IngredientDocument } from "../models/ingredient.model";

import * as ingredientOperationsDB from "../data-access/ingredient.da";

import { IngredientType } from "../../interfaces";

/**
 * @module ingredients.service
 * 
 * @description This module provides operations for managing user ingredients
 * @exports ingredientOperations
 */

const ingredientOperations = {
    getByCategory: async (category: string): Promise<IngredientDocument[]> => {
        const ingredients = await ingredientOperationsDB.getIngredientsByCategoryDB(category)
        return ingredients
    },
    
    search: async (
        query: FilterQuery<IngredientDocument>,
        type: IngredientType
    ): Promise<IngredientDocument[]> => {
        const ingredients = await ingredientOperationsDB.searchIngredientsByQueryAndTypeDB(query, type)
        return ingredients
    },
}

export default ingredientOperations