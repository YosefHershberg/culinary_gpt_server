import Ingredient from "../models/ingredient.model"
import UserIngredient from "../models/UserIngredients.model"

export const getByCategory = async (category: string) => {
    const ingredients = await Ingredient.find({ category })
    return ingredients
}

export const search = async (query: string) => {
    const ingredients = await Ingredient.find({ name: { $regex: query, $options: 'i' } })
    return ingredients
}

export const addUserIngredient = async (userId: string, ingredientId: string, name: string) => {
    const ingredient = new UserIngredient({
        userId,
        ingredientId,
        name
    })
    const newIngredient = await ingredient.save()
    return newIngredient
}

export const deleteUserIngredient = async (userId: string, ingredientId: string) => {
    const ingredient = await UserIngredient.findOneAndDelete({ userId, ingredientId })
    return ingredient
}

export const getUserIngredients = async (userId: string) => {
    const ingredients = await UserIngredient.find({ userId })
    return ingredients
}