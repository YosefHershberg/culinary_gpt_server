import prisma from "../../config/prisma";
import type { KitchenUtilsModel } from "../../generated/prisma/models";

const DISPLAY_TO_COLUMN: Record<string, string> = {
    "Stove Top": "stoveTop",
    "Oven": "oven",
    "Microwave": "microwave",
    "Air Fryer": "airFryer",
    "Blender": "blender",
    "Food Processor": "foodProcessor",
    "Slow Cooker": "slowCooker",
    "BBQ": "bbq",
    "Grill": "grill",
};

export const getKitchenUtilsDB = async (userId: string): Promise<KitchenUtilsModel> => {
    const row = await prisma.kitchenUtils.findUnique({ where: { userId } });

    if (!row) {
        throw new Error('Kitchen utilities not found');
    }

    return row;
}

export const createKitchenUtilsDB = async (userId: string): Promise<KitchenUtilsModel> => {
    return prisma.kitchenUtils.create({
        data: {
            userId,
            stoveTop: true,
            oven: true,
            microwave: true,
            airFryer: false,
            blender: true,
            foodProcessor: false,
            slowCooker: false,
            bbq: false,
            grill: false,
        },
    });
}

export const toggleKitchenUtilDB = async (userId: string, name: string): Promise<KitchenUtilsModel> => {
    const columnName = DISPLAY_TO_COLUMN[name];
    if (!columnName) {
        throw new Error(`Unknown kitchen utility: ${name}`);
    }

    const current = await prisma.kitchenUtils.findUnique({ where: { userId } });

    if (!current) {
        throw new Error('Kitchen utilities not found');
    }

    return prisma.kitchenUtils.update({
        where: { userId },
        data: { [columnName]: !(current as Record<string, unknown>)[columnName] },
    });
}

export const deleteKitchenUtilsDB = async (userId: string): Promise<KitchenUtilsModel> => {
    return prisma.kitchenUtils.delete({ where: { userId } });
}
