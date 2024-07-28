import { getUserDB } from "../data-access/user.da";

export const kitchenUtilsOperations = {
    get: async (userId: string) => {
        const user = await getUserDB(userId)
        return user.kitchenUtils
    },

    update: async (userId: string, name: string, value: boolean) => {
        const user = await getUserDB(userId)

        //@ts-expect-error
        user.kitchenUtils[name] = value;
        await user.save();
        return { message: 'Kitchen utilities updated successfully' }
    }
}