import { FilterQuery } from "mongoose"
import IngredientModel from "../models/ingredient.model"
import { Ingredient, IngredientType } from "../../types"

export const getIngredientsByCategoryDB = async (category: string): Promise<Ingredient[]> => {
    const ingredients = await IngredientModel.find({ category }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients
}

export const searchIngredientsByQueryAndTypeDB = async (
    query: FilterQuery<Ingredient>,
    type: IngredientType
): Promise<Ingredient[]> => {
    const ingredients = await IngredientModel.find({
        name: { $regex: query, $options: 'i' },
        type: { $all: [type] },
    }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients
}

export const getManyIngredientsByLabelsDB = async (labels: string[]): Promise<Ingredient[]> => {
    const ingredients = await IngredientModel.find({ name: { $in: labels } }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients
}