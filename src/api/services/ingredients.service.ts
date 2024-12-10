import { FilterQuery } from "mongoose";

import { IngredientDocument } from "../models/ingredient.model";

import * as ingredientOperationsDB from "../data-access/ingredient.da";
import { addMultipleUserIngredientsDB, addUserIngredientDB, deleteAllUserIngredientsDB, deleteUserIngredientDB, getUserIngredientsDB } from "../data-access/userIngredient.da";

import { IngredientType, PartialUserIngredientResponse as PartialIngredient } from "../../interfaces";
import MessageResponse from "../../interfaces/MessageResponse";
import { UserIngredientInterface } from "../models/UserIngredients.model";

/**
 * @module ingredients.service
 * 
 * @description This module provides operations for managing user ingredients
 * @exports ingredientOperations
 */


export const ingredientOperations = {
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