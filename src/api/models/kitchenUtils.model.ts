import mongoose, { Document } from 'mongoose';
import { mongooseVirtuals } from '../../utils/helperFunctions';

export interface IKitchenUtils extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const kitchenUtilsSchema = new mongoose.Schema<IKitchenUtils>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
}, mongooseVirtuals());

const KitchenUtils = mongoose.model<IKitchenUtils>('KitchenUtils', kitchenUtilsSchema);

export default KitchenUtils;