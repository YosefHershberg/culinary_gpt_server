import mongoose, { Document } from 'mongoose';
import { mongooseVirtuals } from '../../utils/helperFunctions';

export interface UserIngrdientDocument extends Document {
    userId: string;
    ingredientId: string;
    name: string;
}

const userIngredientSchema = new mongoose.Schema<UserIngrdientDocument>({
    userId: {
        type: String,
        required: true,
    },
    ingredientId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (_doc: any, ret: any) => {
            ret.id = ret.ingredientId;
            delete ret.ingredientId;
            delete ret._id;
            delete ret.userId;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        versionKey: false,
        transform: (_doc: any, ret: any) => {
            ret.id = ret.ingredientId;
            delete ret.ingredientId;
            delete ret._id;
            delete ret.userId;
            return ret;
        }
    }
});

const UserIngredient = mongoose.model<UserIngrdientDocument>('UserIngredient', userIngredientSchema);

export default UserIngredient;