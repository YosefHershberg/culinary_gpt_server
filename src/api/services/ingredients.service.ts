
import { Ingredient } from "../../interfaces";
import { getUserWithIngredientsDB, getUserDB } from "../data-access/user.da";
import * as ingredientOperationsDB from "../data-access/ingredient.da";

export const userIngredientOperations = {
    getAll: async (userId: string) => {
        const user = await getUserWithIngredientsDB(userId)
        return user.ingredients
    },

    addIngredient: async (userId: string, ingredient: Ingredient) => {
        const user = await getUserDB(userId)
        user.ingredients.push(ingredient.id as string)
        await user.save()
        return ingredient
    },

    deleteIngredient: async (userId: string, ingredientId: string) => {
        const user = await getUserDB(userId)
        const newIngredients = user.ingredients.filter(ingredient => ingredient.toString() !== ingredientId)
        user.ingredients = newIngredients
        await user.save()
        return { message: 'Ingredient deleted' }
    }
}

export const ingredientOperations = {
    getByCategory: async (category: string) => {
        const ingredients = await ingredientOperationsDB.getByCategory(category)
        return ingredients
    },
    search: async (query: string) => {
        const ingredients = await ingredientOperationsDB.search(query)
        console.log(ingredients)
        return ingredients
    }
}