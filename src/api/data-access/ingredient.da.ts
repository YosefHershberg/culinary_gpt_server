import { Ingredient as IngredientInterface } from "../../interfaces"
import Ingredient from "../models/ingredient.model"
import UserIngredient from "../models/UserIngredients.model"

export const getByCategory = async (category: string): Promise<IngredientInterface[]> => {
    const ingredients = await Ingredient.find({ category })
    return ingredients as IngredientInterface[]
}

export const search = async (query: string): Promise<IngredientInterface[]> => {
    const ingredients = await Ingredient.find({ name: { $regex: query, $options: 'i' } })
    return ingredients as IngredientInterface[]
}

export const addUserIngredient =
    async (userId: string, ingredientId: string, name: string): Promise<IngredientInterface> => {
        const ingredient = new UserIngredient({
            userId,
            ingredientId,
            name
        })
        const newIngredient = await ingredient.save()
        return newIngredient as IngredientInterface
    }

export const deleteUserIngredient = async (userId: string, ingredientId: string): Promise<IngredientInterface> => {
    const ingredient = await UserIngredient.findOneAndDelete({ userId, ingredientId })
    return ingredient as IngredientInterface
}

export const getUserIngredients = async (userId: string): Promise<IngredientInterface[]> => {
    const ingredients = await UserIngredient.find({ userId })
    return ingredients as IngredientInterface[]
}