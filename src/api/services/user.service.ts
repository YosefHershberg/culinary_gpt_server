import firebaseStorageOperations from "./firebase.service";
import recipeOperations from "./recipes.service";

import { createUserDB, CreateUserDBProps, deleteUserDB, getUserBySubscriptionIdDB, getUserDB, updateUserDB, UpdateUserDBProps } from "../data-access/user.da";
import { UserDocument } from "../models/user.model";
import { createKitchenUtilsDB, deleteKitchenUtilsDB } from "../data-access/kitchenUtils.da";
import { deleteUserRecipesDB } from "../data-access/recipe.da";
import { deleteAllUserIngredientsDB } from "../data-access/userIngredient.da";
import { subscribe, unsubscribe } from "diagnostics_channel";

/**
 * @module user.service
 * 
 * @description This module provides operations for user
 * @exports userOperations
 */

const userOperations = {
    /**
     * @description This function creates a user & kitchen utilities
     * @param userData 
     * @returns 
     */
    createUser: async (userData: CreateUserDBProps): Promise<UserDocument> => {
        const [user, _kitchenUtils] = await Promise.all([
            createUserDB(userData),
            createKitchenUtilsDB(userData.clerkId)
        ])
        return user;
    },

    /**
     * @description This function deletes a user & user-recipes & recipe images from firebase storage & user ingredients
     * @param {string} userId 
     * @returns {UserDocument}
     */
    deleteUser: async (userId: string): Promise<UserDocument> => {
        const recipes = await recipeOperations.getAllUserRecipes(userId);

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
            // TODO: batch these operations
            recipes.map(recipe =>
                firebaseStorageOperations.deleteImage(recipe.recipe.id)
            ),
        ])

        return user;
    },

    /**
     * @description This function updates a user
     * @param {string} userId 
     * @param {UpdateUserDBProps} update 
     * @returns {UserDocument}
     */
    updateUser: async (userId: string, update: UpdateUserDBProps): Promise<UserDocument> => {
        const user = await updateUserDB(userId, update);
        return user;
    },

    /**
     * @description This function subscribes a user
     * @param {string} userId
     * @param {string} stripeCustomerId
     * @param {string} stripeSubscriptionId
     * @returns {UserDocument}
     */
    subscribe: async (userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<UserDocument> => {
        const user = await updateUserDB(userId, {
            isSubscribed: true,
            stripeCustomerId,
            stripeSubscriptionId,
        });
        return user;
    },

    unsubscribe: async (subscriptionId: string): Promise<UserDocument> => {
        const user = await getUserBySubscriptionIdDB(subscriptionId);

        const newUser = await updateUserDB(user.clerkId, {
            isSubscribed: false,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
        });

        return newUser;
    },

    isSubscribed: async (userId: string): Promise<boolean> => {
        const user = await getUserDB(userId);
        return user.isSubscribed;
    }
}

export default userOperations