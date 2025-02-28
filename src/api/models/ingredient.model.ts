import mongoose, { Document } from 'mongoose';
import { mongooseVirtuals } from '../../utils/helperFunctions';
import { Ingredient } from '../../types';

export type IngredientDocument = Document & Ingredient

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
    popularity: {
        type: Number,
        required: true,
    },
    type: {
        type: [String],
        enum: ['food', 'drink'],
        required: true,
    }
}, mongooseVirtuals);

const Ingredient = mongoose.model<IngredientDocument>('Ingredient', ingredientSchema);

export default Ingredient;