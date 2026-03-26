import { addMultipleUserIngredientsDB, addUserIngredientDB, deleteAllUserIngredientsDB, deleteUserIngredientDB, getUserIngredientsDB } from "../data-access/userIngredient.da";

import type { IngredientModel } from "../../generated/prisma/models";
import type { UserIngredientResponse, MessageResponse } from "../../types";

/**
 * @module ingredients.service
 * 
 * @description This module provides services for managing user ingredients
 * @exports userIngredientServices
 */

const userIngredientServices = {
    getAll: async (userId: string): Promise<UserIngredientResponse[]> => {
        const ingredients = await getUserIngredientsDB(userId);
        return ingredients;
    },

    addIngredient: async (userIngredient: { userId: string; ingredientId: string; name: string; type: string[] }): Promise<UserIngredientResponse> => {
        const newIngredient = await addUserIngredientDB(userIngredient);
        return newIngredient;
    },

    deleteIngredient: async (userId: string, ingredientId: string): Promise<MessageResponse> => {
        await deleteUserIngredientDB(userId, ingredientId);
        return { message: "Ingredient deleted successfully" };
    },

    addMultiple: async (userId: string, userIngredients: IngredientModel[]): Promise<UserIngredientResponse[]> => {
        const userIngredientDocs = userIngredients.map((ingredient) => ({
            userId,
            ingredientId: ingredient.id,
            name: ingredient.name,
            type: ingredient.type,
        }));

        const newIngredients = await addMultipleUserIngredientsDB(userIngredientDocs);
        return newIngredients;
    },

    deleteAll: async (userId: string): Promise<MessageResponse> => {
        await deleteAllUserIngredientsDB(userId);
        return { message: "All ingredients deleted successfully" };
    },
}

export default userIngredientServices