import Ingredient from "../models/ingredient.model"

export const getByCategory = async (category: string) => {
    const ingredients = await Ingredient.find({ category })
    return ingredients
}

export const search = async (query: string) => {
    const ingredients = await Ingredient.find({ name: { $regex: query, $options: 'i' } })
    return ingredients
}
