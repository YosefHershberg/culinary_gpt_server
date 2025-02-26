import {  IngredientType } from "../../types"
import Ingredient, { IngredientDocument } from "../models/ingredient.model"
import { FilterQuery } from "mongoose"

export const getIngredientsByCategoryDB = async (category: string): Promise<IngredientDocument[]> => {
    const ingredients = await Ingredient.find({ category }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients
}

export const searchIngredientsByQueryAndTypeDB = async (
    query: FilterQuery<IngredientDocument>,
    type: IngredientType
): Promise<IngredientDocument[]> => {
    const ingredients = await Ingredient.find({
        name: { $regex: query, $options: 'i' },
        type: { $all: [type] },
    }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients
}

export const getManyIngredientsByLabelsDB = async (labels: string[]): Promise<IngredientDocument[]> => {
    const ingredients = await Ingredient.find({ name: { $in: labels } }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients
}