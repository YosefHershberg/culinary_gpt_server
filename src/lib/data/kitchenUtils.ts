import type { KitchenUtilsModel } from "../../generated/prisma/models";

export const kitchenUtils: Omit<KitchenUtilsModel, 'id' | 'userId'> = {
    stoveTop: true,
    oven: true,
    microwave: false,
    airFryer: false,
    blender: false,
    foodProcessor: false,
    slowCooker: false,
    bbq: true,
    grill: false,
}