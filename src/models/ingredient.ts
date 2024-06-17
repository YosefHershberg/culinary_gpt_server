import mongoose from 'mongoose';
import { mongooseVirtuals } from '../utils/helperFunctions';

const ingredientSchema = new mongoose.Schema({
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

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

export default Ingredient;