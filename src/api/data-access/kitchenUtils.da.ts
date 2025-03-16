import KitchenUtils from "../models/kitchenUtils.model";
import type { KitchenUtils as KitchenUtilsType } from "../../types";

export const getKitchenUtilsDB = async (userId: string): Promise<KitchenUtilsType> => {
    const res = await KitchenUtils.findOne({ userId }).exec();

    if (!res) {
        throw new Error('Kitchen utilities not found');
    }

    return res.kitchenUtils;
}

export const createKitchenUtilsDB = async (userId: string): Promise<KitchenUtilsType> => {
    const kitchenUtils = new KitchenUtils({
        kitchenUtils: {
            "Stove Top": true,
            "Oven": true,
            "Microwave": true,
            "Air Fryer": false,
            "Blender": true,
            "Food Processor": false,
            "Slow Cooker": false,
            "BBQ": false,
            "Grill": false,
        },
        userId
    });

    const newKitchenUtilsDoc = await kitchenUtils.save();
    const newKitchenUtils = newKitchenUtilsDoc.toObject();

    return newKitchenUtils.kitchenUtils;
}

export const toggleKitchenUtilDB = async (userId: string, name: string): Promise<KitchenUtilsType> => {
    const kitchenUtils = await KitchenUtils.findOne({ userId }).exec();

    if (!kitchenUtils) {
        throw new Error('Kitchen utilities not found');
    }

    //@ts-expect-error
    kitchenUtils.kitchenUtils[name] = !kitchenUtils.kitchenUtils[name];

    const newKitchenUtilsDoc = await kitchenUtils.save();
    const newKitchenUtils = newKitchenUtilsDoc.toObject();

    return newKitchenUtils.kitchenUtils;
}

export const deleteKitchenUtilsDB = async (userId: string): Promise<KitchenUtilsType> => {
    const kitchenUtils = await KitchenUtils.findOneAndDelete({ userId }).exec();

    if (!kitchenUtils) {
        throw new Error('Kitchen utilities not found');
    }

    return kitchenUtils.kitchenUtils;
}