import mongoose, { Document } from "mongoose";
import { mongooseVirtuals } from '../../utils/helperFunctions';
import { Recipe } from '../../types';

type RecipeDocument = Document & {
    recipe: Recipe,
    image_url: string;
    userId: string;
    createdAt: Date;
}

const recipeSchema = new mongoose.Schema<RecipeDocument>({
    recipe: {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        ingredients: [{
            ingredient: {
                type: String,
                required: true,
            }
        }],
        steps: [{
            step: {
                type: String,
                required: true,
            },
            time: {
                type: String,
                required: true,
            }
        }],
        time: {
            type: String,
            required: true,
        },
        level: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['recipe', 'cocktail'],
            required: true,
        },
        id: {
            type: String,
            required: true,
        }
    },
    image_url: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, mongooseVirtuals);

const Recipe = mongoose.model<RecipeDocument>('Recipe', recipeSchema);

export default Recipe;