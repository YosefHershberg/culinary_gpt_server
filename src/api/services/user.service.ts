import { hashString } from "../../utils/helperFunctions";
import { firebaseStorageOperations } from "./firebase.service";

import { recipeOperations } from "./recipes.service";
import { userIngredientOperations } from "./ingredients.service";

import { deleteUserRecipes } from "../data-access/recipe.da";
import { createUserDB, CreateUserDBProps, deleteUserDB, updateUserDB, UpdateUserDBProps } from "../data-access/user.da";
import { UserDocument } from "../models/user.model";

export const userOperations = {
    createUser: async (userData: CreateUserDBProps): Promise<UserDocument> => {
        const user = await createUserDB(userData);
        return user;
    },

    deleteUser: async (userId: string): Promise<UserDocument> => {
        const recipes = await recipeOperations.getUserRecipes(userId);

        const [user] = await Promise.all([
            deleteUserDB(userId),
            deleteUserRecipes(userId),
            userIngredientOperations.deleteAll(userId),
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