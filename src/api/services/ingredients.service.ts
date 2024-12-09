import { FilterQuery } from "mongoose";

import { IngredientDocument } from "../models/ingredient.model";

import * as ingredientOperationsDB from "../data-access/ingredient.da";
import { addMultipleIngredientsDB, addUserIngredientDB, deleteAllUserIngredientsDB, deleteUserIngredientDB, getUserIngredientsDB } from "../data-access/ingredient.da";

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
        const ingredients = await getUserIngredientsDB(userId);
        return ingredients;
    },

    addIngredient: async (userIngredient: UserIngredientInterface): Promise<PartialIngredient> => {
        const newIngredient = await addUserIngredientDB(userIngredient);
        return newIngredient;
    },

    deleteIngredient: async (userId: string, ingredientId: string): Promise<MessageResponse> => {
        await deleteUserIngredientDB(userId, ingredientId);
        return { message: "Ingredient deleted successfully" };
    },

    addMultiple: async (userId: string, userIngredients: IngredientDocument[]): Promise<PartialIngredient[]> => {
        const userIngredientDocs: UserIngredientInterface[] = userIngredients.map((ingredient) => ({
            userId,
            ingredientId: ingredient.id,
            name: ingredient.name,
            type: ingredient.type,
        }));

        const newIngredients = await addMultipleIngredientsDB(userIngredientDocs);
        return newIngredients;
    },

    deleteAll: async (userId: string): Promise<MessageResponse> => {
        await deleteAllUserIngredientsDB(userId);
        return { message: "All ingredients deleted successfully" };
    },
}

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