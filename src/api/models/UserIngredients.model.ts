import mongoose, { Document } from 'mongoose';

export interface UserIngredientDocument extends Document {
    userId: string;
    ingredientId: string;
    name: string;
}
// NOTE: This model does not return json in this format ^^^
// it is reconstructed to { id, name } in the toJSON and toObject methods

const userIngredientSchema = new mongoose.Schema<UserIngredientDocument>({
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

const UserIngredient = mongoose.model<UserIngredientDocument>('UserIngredient', userIngredientSchema);

export default UserIngredient;