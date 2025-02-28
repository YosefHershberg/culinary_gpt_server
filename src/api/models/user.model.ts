import mongoose, { Document } from 'mongoose';
import { mongooseVirtuals } from '../../utils/helperFunctions';
import { User as UserType } from '../../types';

export type UserDocument = UserType & Document;

const userSchema = new mongoose.Schema<UserDocument>({
    first_name: {
        type: String,
        required: true,
        trim: true,
    },
    last_name: {
        type: String,
        required: true,
        trim: true,
    },
    clerkId: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    isSubscribed: {
        type: Boolean,
        default: false,
    },
    stripeCustomerId: {
        type: String,
    },
    stripeSubscriptionId: {
        type: String,
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
}, mongooseVirtuals);

// userSchema.path('recipes').select(false)

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

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;
