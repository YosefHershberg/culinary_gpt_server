import mongoose, { Document } from 'mongoose';
import { mongooseVirtuals } from '../../utils/helperFunctions';
import { KitchenUtils } from '../../interfaces';

export interface IKitchenUtils extends Document {
  kitchenUtils: KitchenUtils,
  userId: string,
}

const kitchenUtilsSchema = new mongoose.Schema<IKitchenUtils>({
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

const KitchenUtils = mongoose.model<IKitchenUtils>('KitchenUtils', kitchenUtilsSchema);

export default KitchenUtils;