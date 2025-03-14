import { createUserDB, CreateUserDBProps, deleteUserDB, getUserBySubscriptionIdDB, getUserDB, updateUserDB, UpdateUserDBProps } from "../data-access/user.da";
import { createKitchenUtilsDB, deleteKitchenUtilsDB } from "../data-access/kitchenUtils.da";
import { deleteUserRecipesDB } from "../data-access/recipe.da";
import { deleteAllUserIngredientsDB } from "../data-access/userIngredient.da";

import firebaseStorageServices from "./firebase.service";
import recipeServices from "./recipes.service";
import { type User } from "../../types";

/**
 * @module user.service
 * 
 * @description This module provides Services for user
 * @exports userServices
 */

const userServices = {
    /**
     * @description This function creates a user & kitchen utilities
     * @param userData 
     * @returns {User}
     */
    createUser: async (userData: CreateUserDBProps): Promise<User> => {
        const [user, _kitchenUtils] = await Promise.all([
            createUserDB(userData),
            createKitchenUtilsDB(userData.clerkId)
        ])
        return user;
    },

    /**
     * @description This function deletes a user & user-recipes & recipe images from firebase storage & user ingredients
     * @param {string} userId 
     * @returns {User}
     */
    deleteUser: async (userId: string): Promise<User> => {
        const recipes = await recipeServices.getAllUserRecipes(userId);

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
            // TODO: batch these Services
            recipes.map(recipe =>
                firebaseStorageServices.deleteImage(recipe.recipe.id)
            ),
        ])

        return user;
    },

    /**
     * @description This function updates a user
     * @param {string} userId 
     * @param {UpdateUserDBProps} update 
     * @returns {User}
     */
    updateUser: async (userId: string, update: UpdateUserDBProps): Promise<User> => {
        const user = await updateUserDB(userId, update);
        return user;
    },

    /**
     * @description This function subscribes a user
     * @param {string} userId
     * @param {string} stripeCustomerId
     * @param {string} stripeSubscriptionId
     * @returns {User}
     */
    subscribe: async (userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> => {
        const user = await updateUserDB(userId, {
            isSubscribed: true,
            stripeCustomerId,
            stripeSubscriptionId,
        });
        return user;
    },

    unsubscribe: async (subscriptionId: string): Promise<User> => {
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

export default userServices