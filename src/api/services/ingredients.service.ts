import { FilterQuery } from "mongoose";

import { IngredientDocument } from "../models/ingredient.model";

import * as ingredientOperationsDB from "../data-access/ingredient.da";
import { addUserIngredient, deleteAllUserIngredients, deleteUserIngredient, getUserIngredients } from "../data-access/ingredient.da";

import { IngredientType, UserIngredient } from "../../interfaces";
import MessageResponse from "../../interfaces/MessageResponse";

/**
 * @module ingredients.service
 * 
 * @description This module provides operations for managing user ingredients
 * @exports userIngredientOperations
 * @exports ingredientOperations
 */

export const userIngredientOperations = {
    getAll: async (userId: string): Promise<UserIngredient[]> => {
        const ingredients = await getUserIngredients(userId);
        return ingredients;
    },

    addIngredient: async (userId: string, ingredientId: string, name: string): Promise<UserIngredient> => {
        const newIngredient = await addUserIngredient(userId, ingredientId, name);
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
        return ingredients as IngredientDocument[]
    },
    search: async (
        query: FilterQuery<IngredientDocument>,
        type: IngredientType
    ): Promise<IngredientDocument[]> => {
        const ingredients = await ingredientOperationsDB.searchByQueryAndIngredientType(query, type)
        return ingredients as IngredientDocument[]
    },
}