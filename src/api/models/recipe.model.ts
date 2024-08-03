import mongoose, { Document } from "mongoose";
import { mongooseVirtuals } from '../../utils/helperFunctions';
import { Recipe } from "../../interfaces";

export interface RecipeDocument extends Document {
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
}, mongooseVirtuals());

// recipeSchema.pre<Recipe>('save', async function(next) {
//     const user = await User.findById(this.userId);
//     if (user) {
//         user.recipes.push(this._id);
//         await user.save();
//     }
//     next();
// });

const Recipe = mongoose.model<RecipeDocument>('Recipe', recipeSchema);

export default Recipe;