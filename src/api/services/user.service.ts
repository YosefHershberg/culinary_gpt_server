import { hashString } from "../../utils/helperFunctions";
import firebaseStorageOperations from "./firebase.service";

import recipeOperations from "./recipes.service";

import { createUserDB, CreateUserDBProps, deleteUserDB, updateUserDB, UpdateUserDBProps } from "../data-access/user.da";
import { UserDocument } from "../models/user.model";
import { createKitchenUtilsDB, deleteKitchenUtilsDB } from "../data-access/kitchenUtils.da";
import { deleteUserRecipesDB } from "../data-access/recipe.da";
import { deleteAllUserIngredientsDB } from "../data-access/userIngredient.da";

/**
 * @module user.service
 * 
 * @description This module provides operations for user
 * @exports userOperations
 */

const userOperations = {
    createUser: async (userData: CreateUserDBProps): Promise<UserDocument> => {
        const [user, _kitchenUtils] = await Promise.all([
            createUserDB(userData),
            createKitchenUtilsDB(userData.clerkId)
        ])
        return user;
    },

    /**
     * @description This function deletes a user & recipes & recipe images from firebase storage & user ingredients
     * @param {string} userId 
     * @returns {UserDocument}
     */
    deleteUser: async (userId: string): Promise<UserDocument> => {
        const recipes = await recipeOperations.getUserRecipes(userId);

        const [user] = await Promise.all([
            //delete user
            deleteUserDB(userId),

            //delete user recipes
            deleteUserRecipesDB(userId),

            //delete user kitchen utilities
            deleteKitchenUtilsDB(userId),

            //delete user ingredients
            deleteAllUserIngredientsDB(userId),

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