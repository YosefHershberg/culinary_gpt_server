import mongoose, { Document } from 'mongoose';
import { mongooseVirtuals } from '../../utils/helperFunctions';

export interface IKitchenUtils extends Document {
  "Stove Top": boolean,
  "Oven": boolean,
  "Microwave": boolean,
  "Air Fryer": boolean,
  "Blender": boolean,
  "Food Processor": boolean,
  "Slow Cooker": boolean,
  "BBQ": boolean,
  "Grill": boolean,
  userId: string,
}

const kitchenUtilsSchema = new mongoose.Schema<IKitchenUtils>({
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
  userId: {
    type: String,
    ref: 'User',
    required: true
  }
}, mongooseVirtuals());

const KitchenUtils = mongoose.model<IKitchenUtils>('KitchenUtils', kitchenUtilsSchema);

export default KitchenUtils;