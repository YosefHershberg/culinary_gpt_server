import mongoose, { Document } from 'mongoose';
import { mongooseVirtuals } from '../../utils/helperFunctions';

export interface IngredientDocument extends Document {
    name: string;
    category: string[];
};

const ingredientSchema = new mongoose.Schema<IngredientDocument>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: [String],
        enum: ['common', 'dairy', 'vegetables', 'spices', 'carbs', 'meat'],
        required: true,
    },
}, mongooseVirtuals());

const Ingredient = mongoose.model<IngredientDocument>('Ingredient', ingredientSchema);

export default Ingredient;