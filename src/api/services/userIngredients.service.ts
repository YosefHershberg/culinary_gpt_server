import { UserIngredientType } from "../models/UserIngredients.model";
import { addMultipleUserIngredientsDB, addUserIngredientDB, deleteAllUserIngredientsDB, deleteUserIngredientDB, getUserIngredientsDB } from "../data-access/userIngredient.da";

import { type UserIngredient as UserIngredient, type MessageResponse, type Ingredient } from "../../types";

/**
 * @module ingredients.service
 * 
 * @description This module provides services for managing user ingredients
 * @exports userIngredientServices
 */

const userIngredientServices = {
    getAll: async (userId: string): Promise<UserIngredient[]> => {
        const ingredients = await getUserIngredientsDB(userId);
        return ingredients;
    },

    addIngredient: async (userIngredient: UserIngredientType): Promise<UserIngredient> => {
        const newIngredient = await addUserIngredientDB(userIngredient);
        return newIngredient;
    },

    deleteIngredient: async (userId: string, ingredientId: string): Promise<MessageResponse> => {
        await deleteUserIngredientDB(userId, ingredientId);
        return { message: "Ingredient deleted successfully" };
    },

    addMultiple: async (userId: string, userIngredients: Ingredient[]): Promise<UserIngredient[]> => {
        const userIngredientDocs: UserIngredientType[] = userIngredients.map((ingredient) => ({
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