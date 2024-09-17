import { DeleteResult } from "mongodb"
import { UserIngredientResponse as IngredientInterface, IngredientType } from "../../interfaces"
import Ingredient, { IngredientDocument } from "../models/ingredient.model"
import UserIngredient, { UserIngredientInterface } from "../models/UserIngredients.model"
import { FilterQuery } from "mongoose"

export const getByCategory = async (category: string): Promise<IngredientInterface[]> => {
    const ingredients = await Ingredient.find({ category }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients as IngredientInterface[]
}

export const searchByQueryAndIngredientType = async (
    query: FilterQuery<IngredientDocument>,
    type: IngredientType
): Promise<IngredientInterface[]> => {
    const ingredients = await Ingredient.find({
        name: { $regex: query, $options: 'i' },
        type: { $all: [type] },
    }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients as IngredientInterface[]
}

export const addUserIngredient =
    async (userIngredient: UserIngredientInterface): Promise<IngredientInterface> => {
        const ingredient = new UserIngredient(userIngredient)
        const newIngredient = await ingredient.save()
        return newIngredient as IngredientInterface
    }

export const deleteUserIngredient = async (userId: string, ingredientId: string): Promise<IngredientInterface> => {
    const ingredient = await UserIngredient.findOneAndDelete({ userId, ingredientId }).exec()

    if (!ingredient) {
        throw new Error('Ingredient not found')
    }

    return ingredient as IngredientInterface
}

export const getUserIngredients = async (userId: string): Promise<IngredientInterface[]> => {
    const ingredients = await UserIngredient.find({ userId }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients as IngredientInterface[]
}

export const getUserIngredientsByType = async (userId: string, type: IngredientType): Promise<IngredientInterface[]> => {
    const ingredients = await UserIngredient.find({ userId, type }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients as IngredientInterface[]
}

export const deleteAllUserIngredients = async (userId: string): Promise<DeleteResult> => {
    return await UserIngredient.deleteMany({ userId }).exec()
}