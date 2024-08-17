import { hashString } from "../../utils/helperFunctions";
import { firebaseStorageOperations } from "./firebase.service";

import { recipeOperations } from "./recipes.service";
import { userIngredientOperations } from "./ingredients.service";

import { deleteUserRecipes } from "../data-access/recipe.da";
import { createUserDB, CreateUserDBProps, deleteUserDB, updateUserDB, UpdateUserDBProps } from "../data-access/user.da";
import { UserDocument } from "../models/user.model";

/**
 * @module user.service
 * 
 * @description This module provides operations for user
 * @exports userOperations
 */

export const userOperations = {
    createUser: async (userData: CreateUserDBProps): Promise<UserDocument> => {
        const user = await createUserDB(userData);
        return user;
    },

    /**
     * @description This function deletes a user & recipes &  recipe images from firebase storage & user ingredients
     * @param {string} userId 
     * @returns {UserDocument}
     */
    deleteUser: async (userId: string): Promise<UserDocument> => {
        const recipes = await recipeOperations.getUserRecipes(userId);

        const [user] = await Promise.all([
            //delete user
            deleteUserDB(userId),

            //delete user recipes
            deleteUserRecipes(userId),

            //delete user ingredients
            userIngredientOperations.deleteAll(userId),

            //delete recipe images from firebase storage
            recipes.map(recipe =>
                firebaseStorageOperations.deleteImage(hashString(recipe.recipe.description))
            ),
        ])

        return user;
    },

    updateUser: async (userId: string, update: UpdateUserDBProps): Promise<UserDocument> => {
        const user = await updateUserDB(userId, update);
        return user;
    }
}

export default userOperations