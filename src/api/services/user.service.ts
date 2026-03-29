import { createUserDB, CreateUserDBProps, deleteUserDB, getUserBySubscriptionIdDB, getUserDB, updateUserDB, UpdateUserDBProps } from "../data-access/user.da";
import { createKitchenUtilsDB } from "../data-access/kitchenUtils.da";

import storageServices from "./storage.service";
import type { UserModel } from "../../generated/prisma/models";

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
    createUser: async (userData: CreateUserDBProps): Promise<UserModel> => {
        const [user] = await Promise.all([
            createUserDB(userData),
            createKitchenUtilsDB(userData.userId),
        ]);
        return user;
    },

    /**
     * @description This function deletes a user & user-recipes & recipe images from storage & user ingredients
     * @param {string} userId 
     * @returns {User}
     */
    deleteUser: async (userId: string): Promise<UserModel> => {
        // DB cascade handles recipes, kitchen utils, and user ingredients
        // Storage images are organized by user folder and bulk-deleted in 2 calls
        const [user] = await Promise.all([
            deleteUserDB(userId),
            storageServices.deleteUserImages(userId),
        ]);

        return user;
    },

    /**
     * @description This function updates a user
     * @param {string} userId 
     * @param {UpdateUserDBProps} update 
     * @returns {User}
     */
    updateUser: async (userId: string, update: UpdateUserDBProps): Promise<UserModel> => {
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
    subscribe: async (userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<UserModel> => {
        const user = await updateUserDB(userId, {
            isSubscribed: true,
            stripeCustomerId,
            stripeSubscriptionId,
        });
        return user;
    },

    unsubscribe: async (subscriptionId: string): Promise<UserModel> => {
        const user = await getUserBySubscriptionIdDB(subscriptionId);

        const newUser = await updateUserDB(user.id, {
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