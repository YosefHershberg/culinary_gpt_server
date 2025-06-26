import UserIngredient from "../../api/models/userIngredients.model"
import type { DeleteResult } from "mongodb"
import type { UserIngredientResponse, IngredientType, UserIngredient as UserIngredientType } from "../../types"

export const addUserIngredientDB = async (userIngredient: UserIngredientType): Promise<UserIngredientResponse> => {
    const ingredient = new UserIngredient(userIngredient)
    const newIngredient = await ingredient.save()
    return newIngredient
}

export const addMultipleUserIngredientsDB = async (userIngredientDocs: UserIngredientType[]): Promise<UserIngredientResponse[]> => {
    const createdUserIngredients = await UserIngredient.insertMany(userIngredientDocs);

    return createdUserIngredients;
}

export const deleteUserIngredientDB = async (userId: string, ingredientId: string): Promise<UserIngredientResponse> => {
    const ingredient = await UserIngredient.findOneAndDelete({ userId, ingredientId }).exec()

    if (!ingredient) {
        throw new Error('Ingredient not found')
    }

    return ingredient
}

export const getUserIngredientsDB = async (userId: string): Promise<UserIngredientResponse[]> => {
    const ingredients = await UserIngredient.find({ userId }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients
}

export const getUserIngredientsByTypeDB = async (userId: string, type: IngredientType): Promise<UserIngredientResponse[]> => {
    const ingredients = await UserIngredient.find({ userId, type }).exec()

    if (!ingredients) {
        throw new Error('Ingredients not found')
    }

    return ingredients
}

export const deleteAllUserIngredientsDB = async (userId: string): Promise<DeleteResult> => {
    return await UserIngredient.deleteMany({ userId }).exec()
}