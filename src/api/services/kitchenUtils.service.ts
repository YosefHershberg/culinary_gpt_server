import { getKitchenUtilsDB, toggleKitchenUtilDB } from "../data-access/kitchenUtils.da";
import { KitchenUtils } from "../schemas/kitchenUtils.schema";

/**
 * @module kitchenUtils.service
 * 
 * @description This module provides Services for managing user kitchen utensils
 * @exports kitchenUtilsServices
 */

const kitchenUtilsServices = {
    get: async (userId: string): Promise<KitchenUtils> => {
        const kitchenUtils = await getKitchenUtilsDB(userId);

        return kitchenUtils;
    },

    toggle: async (userId: string, name: string): Promise<KitchenUtils> => {
        const kitchenUtils = await toggleKitchenUtilDB(userId, name);

        return kitchenUtils.kitchenUtils;
    }
}

export default kitchenUtilsServices