import { FilterQuery } from "mongoose";

import { IngredientDocument } from "../models/ingredient.model";

import * as ingredientOperationsDB from "../data-access/ingredient.da";
import { addUserIngredient, deleteAllUserIngredients, deleteUserIngredient, getUserIngredients } from "../data-access/ingredient.da";

import { IngredientType, PartialUserIngredientResponse as PartialIngredient } from "../../interfaces";
import MessageResponse from "../../interfaces/MessageResponse";
import { UserIngredientInterface } from "../models/UserIngredients.model";

/**
 * @module ingredients.service
 * 
 * @description This module provides operations for managing user ingredients
 * @exports userIngredientOperations
 * @exports ingredientOperations
 */

export const userIngredientOperations = {
    getAll: async (userId: string): Promise<PartialIngredient[]> => {
        const ingredients = await getUserIngredients(userId);
        return ingredients;
    },

    addIngredient: async (userIngredient: UserIngredientInterface): Promise<PartialIngredient> => {
        const newIngredient = await addUserIngredient(userIngredient);
        return newIngredient;
    },

    deleteIngredient: async (userId: string, ingredientId: string): Promise<MessageResponse> => {
        await deleteUserIngredient(userId, ingredientId);
        return { message: "Ingredient deleted successfully" };
    },

    deleteAll: async (userId: string): Promise<MessageResponse> => {
        await deleteAllUserIngredients(userId);
        return { message: "All ingredients deleted successfully" };
    }
}

export const ingredientOperations = {
    getByCategory: async (category: string): Promise<IngredientDocument[]> => {
        const ingredients = await ingredientOperationsDB.getByCategory(category)
        return ingredients
    },
    search: async (
        query: FilterQuery<IngredientDocument>,
        type: IngredientType
    ): Promise<IngredientDocument[]> => {
        const ingredients = await ingredientOperationsDB.searchByQueryAndIngredientType(query, type)
        return ingredients
    },
}