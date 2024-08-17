import { KitchenUtils } from "../../interfaces";
import { getUserDB } from "../data-access/user.da";

export const kitchenUtilsOperations = {
    get: async (userId: string): Promise<KitchenUtils> => {
        const user = await getUserDB(userId)
        return user.kitchenUtils
    },

    update: async (userId: string, name: string, value: boolean): Promise<KitchenUtils> => {
        const user = await getUserDB(userId)

        //@ts-expect-error
        user.kitchenUtils[name] = value;
        await user.save();
        return user.kitchenUtils
    }
}