import mongoose, { Document } from 'mongoose';
import { mongooseVirtuals } from '../../utils/helperFunctions';
import { type KitchenUtils } from '../../types';

export type KitchenUtilsDocument = Document & {
  kitchenUtils: KitchenUtils,
  userId: string,
}

const kitchenUtilsSchema = new mongoose.Schema<KitchenUtilsDocument>({
  kitchenUtils: {
    "Stove Top": {
      type: Boolean,
      required: true
    },
    "Oven": {
      type: Boolean,
      required: true
    },
    "Microwave": {
      type: Boolean,
      required: true
    },
    "Air Fryer": {
      type: Boolean,
      required: true
    },
    "Blender": {
      type: Boolean,
      required: true
    },
    "Food Processor": {
      type: Boolean,
      required: true
    },
    "Slow Cooker": {
      type: Boolean,
      required: true
    },
    "BBQ": {
      type: Boolean,
      required: true
    },
    "Grill": {
      type: Boolean,
      required: true
    },
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  }
}, mongooseVirtuals);

const KitchenUtils = mongoose.model<KitchenUtilsDocument>('KitchenUtils', kitchenUtilsSchema);

export default KitchenUtils;