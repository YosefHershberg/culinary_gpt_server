import { KitchenUtils } from "../../interfaces";
import { getKitchenUtilsDB, toggleKitchenUtilDB } from "../data-access/kitchenUtils.da";

/**
 * @module kitchenUtils.service
 * 
 * @description This module provides operations for managing user kitchen utensils
 * @exports kitchenUtilsOperations
 */

const kitchenUtilsOperations = {

    get: async (userId: string): Promise<KitchenUtils> => {
        const kitchenUtils = await getKitchenUtilsDB(userId);

        return kitchenUtils;
    },

    toggle: async (userId: string, name: string): Promise<KitchenUtils> => {
        const kitchenUtils = await toggleKitchenUtilDB(userId, name);

        return kitchenUtils.kitchenUtils;
    }
}

export default kitchenUtilsOperations