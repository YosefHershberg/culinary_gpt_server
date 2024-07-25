import mongoose, { Document } from "mongoose";
import { mongooseVirtuals } from '../../utils/helperFunctions';

export interface RecipeDocument extends Document {
    recipe: {
        title: string;
        description: string;
        ingredients: {
            ingredient: string;
        }[];
        steps: {
            step: string;
            time: string;
        }[];
        time: string;
        level: string;
    },
    image_url: string;
    userId: string;
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