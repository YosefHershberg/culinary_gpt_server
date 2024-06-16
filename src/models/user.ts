import mongoose from 'mongoose';



const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        trim: true,
    },
    clerkId: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    ingredients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient'
    }],
    kitchenUtils: {
        "Stove Top": Boolean,
        "Oven": Boolean,
        "Microwave": Boolean,
        "Air Fryer": Boolean,
        "Blender": Boolean,
        "Food Processor": Boolean,
        "Slow Cooker": Boolean,
        "BBQ": Boolean,
        "Grill": Boolean,
    },
    recipes: [{
        recipe: {
            title: String,
            description: String,
            ingredients: [{
                ingredient: String,
            }],
            steps: [{
                step: String,
                time: String,
            }],
            time: String,
            level: String
        },
        image_url: String,
    }],
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.path('recipes').select(false)



// userSchema.methods.toJSON = function () {
//     const user = this.toObject();
//     return user;
// }

// userSchema.methods.comparePassword = async function (candidatePassword: string) {
//     const user = this as Document & { password: string };
//     return candidatePassword === user.password;
// }

//@ts-ignore
// userSchema.query.byEmail = function (email: string) {
//     //@ts-ignore
//     return this.where({ email: new RegExp(email, 'i') });
//     //NOTE: methods used here should bw queries that can be chained
// }

// userSchema.virtual('isSuperAdmin').get(function (this: { role: string }) {
//     return this.role === 'superadmin';
// });

userSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    // NOTE: can throw error here to stop the save
    // throw new Error('Error in pre save hook');
    next();
});

const User = mongoose.model('User', userSchema);

export default User;

// LEARNING NOTES:
// - anytime you talk to the db use a try catch block and log err.meesage to console