import { DeleteResult } from "mongodb"
import { PartialUserIngredientResponse as PartialIngredient, IngredientType } from "../../interfaces"
import Ingredient, { IngredientDocument } from "../models/ingredient.model"
import UserIngredient, { UserIngredientInterface } from "../models/UserIngredients.model"
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

export const addUserIngredientDB =
    async (userIngredient: UserIngredientInterface): Promise<PartialIngredient> => {
        const ingredient = new UserIngredient(userIngredient)
        const newIngredient = await ingredient.save()
        return newIngredient
    }

export const deleteUserIngredientDB = async (userId: string, ingredientId: string): Promise<PartialIngredient> => {
    const ingredient = await UserIngredient.findOneAndDelete({ userId, ingredientId }).exec()

    if (!ingredient) {
        throw new Error('Ingredient not found')
    }

    return ingredient
}

export const getUserIngredientsDB = async (userId: string): Promise<PartialIngredient[]> => {
    const ingredients = await UserIngredient.find({ userId }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients
}

export const getUserIngredientsByTypeDB = async (userId: string, type: IngredientType): Promise<PartialIngredient[]> => {
    const ingredients = await UserIngredient.find({ userId, type }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients
}

export const deleteAllUserIngredientsDB = async (userId: string): Promise<DeleteResult> => {
    return await UserIngredient.deleteMany({ userId }).exec()
}