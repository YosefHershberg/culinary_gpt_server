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
});

ingredientSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

ingredientSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

export default Ingredient;