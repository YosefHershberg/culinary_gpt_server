import { deleteUserRecipes } from "../data-access/recipe.da";
import { createUserDB, CreateUserDBProps, deleteUserDB, updateUserDB, UpdateUserDBProps } from "../data-access/user.da";

export const userOperations = {
    createUser: async ({ clerkId, first_name, last_name, email }: CreateUserDBProps) => {
        const user = await createUserDB({ clerkId, first_name, last_name, email });
        return user;
    },

    deleteUser: async (userId: string) => {
        const user = await deleteUserDB(userId);
        await deleteUserRecipes(userId);
        return user;
    },

    updateUser: async (userId: string, update: UpdateUserDBProps) => {
        const user = await updateUserDB(userId, update);
        return user;
    }
}

export default userOperations