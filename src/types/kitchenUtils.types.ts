import { type TypeOf } from "zod";
import { kitchenUtilsSchema } from "../api/schemas/kitchenUtils.schema";

export type KitchenUtils = TypeOf<typeof kitchenUtilsSchema>;