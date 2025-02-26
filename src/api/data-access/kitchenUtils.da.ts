import KitchenUtils, { KitchenUtilsDocument } from "../models/kitchenUtils.model";
import { KitchenUtils as KitchenUtilsType } from "../schemas/kitchenUtils.schema";

export const getKitchenUtilsDB = async (userId: string): Promise<KitchenUtilsType> => {
    const res = await KitchenUtils.findOne({ userId }).exec();

    if (!res) {
        throw new Error('Kitchen utilities not found');
    }

    return res.kitchenUtils;
}

export const createKitchenUtilsDB = async (userId: string): Promise<KitchenUtilsDocument> => {
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

    const newKitchenUtils = await kitchenUtils.save();

    return newKitchenUtils;
}

export const toggleKitchenUtilDB = async (userId: string, name: string): Promise<KitchenUtilsDocument> => {
    const kitchenUtils = await KitchenUtils.findOne({ userId }).exec();

    if (!kitchenUtils) {
        throw new Error('Kitchen utilities not found');
    }

    //@ts-expect-error
    kitchenUtils.kitchenUtils[name] = !kitchenUtils.kitchenUtils[name];
    await kitchenUtils.save();

    return kitchenUtils;
}

export const deleteKitchenUtilsDB = async (userId: string): Promise<KitchenUtilsDocument> => {
    const kitchenUtils = await KitchenUtils.findOneAndDelete({ userId }).exec();

    if (!kitchenUtils) {
        throw new Error('Kitchen utilities not found');
    }

    return kitchenUtils;
}