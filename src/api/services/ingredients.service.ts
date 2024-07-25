import * as ingredientOperationsDB from "../data-access/ingredient.da";
import { addUserIngredient, deleteUserIngredient, getUserIngredients } from "../data-access/ingredient.da";

export const userIngredientOperations = {
    getAll: async (userId: string) => {
        const ingredients = await getUserIngredients(userId);
        return ingredients;
    },

    addIngredient: async (userId: string, ingredientId: string, name: string) => {
        const newIngredient = await addUserIngredient(userId, ingredientId, name);
        return newIngredient;
    },

    deleteIngredient: async (userId: string, ingredientId: string) => {
        await deleteUserIngredient(userId, ingredientId);
        return { message: "Ingredient deleted" };
    }
}

export const ingredientOperations = {
    getByCategory: async (category: string) => {
        const ingredients = await ingredientOperationsDB.getByCategory(category)
        return ingredients
    },
    search: async (query: string) => {
        const ingredients = await ingredientOperationsDB.search(query)
        return ingredients
    }
}