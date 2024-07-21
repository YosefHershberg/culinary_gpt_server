
import { Ingredient } from "../../interfaces";
import { getUserWithIngredientsDB, getUserDB } from "../data-access/user.da";

const ingredientOperations = {
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

export default ingredientOperations
