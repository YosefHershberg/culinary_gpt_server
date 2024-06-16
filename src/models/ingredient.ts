import mongoose from 'mongoose';

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
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

export default Ingredient;