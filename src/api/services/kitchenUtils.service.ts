import { getKitchenUtilsDB, toggleKitchenUtilDB } from "../data-access/kitchenUtils.da";
import type { KitchenUtilsModel } from "../../generated/prisma/models";

/**
 * @module kitchenUtils.service
 * 
 * @description This module provides Services for managing user kitchen utensils
 * @exports kitchenUtilsServices
 */

const kitchenUtilsServices = {
    get: async (userId: string): Promise<KitchenUtilsModel> => {
        const kitchenUtils = await getKitchenUtilsDB(userId);

        return kitchenUtils;
    },

    toggle: async (userId: string, name: string): Promise<KitchenUtilsModel> => {
        const kitchenUtils = await toggleKitchenUtilDB(userId, name);

        return kitchenUtils;
    }
}

export default kitchenUtilsServices