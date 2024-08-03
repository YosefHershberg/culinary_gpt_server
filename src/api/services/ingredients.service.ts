import { IngredientDocument } from "../models/ingredient.model";

import { Ingredient } from "../../interfaces";
import MessageResponse from "../../interfaces/MessageResponse";
import * as ingredientOperationsDB from "../data-access/ingredient.da";
import { addUserIngredient, deleteAllUserIngredients, deleteUserIngredient, getUserIngredients } from "../data-access/ingredient.da";
import { FilterQuery } from "mongoose";

export const userIngredientOperations = {
    getAll: async (userId: string): Promise<Ingredient[]> => {
        const ingredients = await getUserIngredients(userId);
        return ingredients;
    },

    addIngredient: async (userId: string, ingredientId: string, name: string): Promise<Ingredient> => {
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
        query: FilterQuery<IngredientDocument>
    ): Promise<IngredientDocument[]> => {
        const ingredients = await ingredientOperationsDB.search(query)
        return ingredients as IngredientDocument[]
    }
}