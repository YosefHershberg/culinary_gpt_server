import { User as UserType } from "../../types";
import User, { UserDocument } from "../models/user.model";

export const getUserDB = async (userId: string): Promise<UserDocument> => {
    const user = await User.findOne({ clerkId: userId }).exec();

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

export type CreateUserDBProps = Omit<UserType, 'createdAt' | 'updatedAt'>;

export const createUserDB = async (userData: CreateUserDBProps): Promise<UserDocument> => {
    const user = new User(userData);
    const newUser = await user.save()

    return newUser;
}

export const deleteUserDB = async (userId: string): Promise<UserDocument> => {
    const user = await User.findOneAndDelete({ clerkId: userId }).exec();

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

export type UpdateUserDBProps = Partial<UserType>;

export const updateUserDB = async (userId: string, update: UpdateUserDBProps): Promise<UserDocument> => {
    const updatedUser = await User.findOneAndUpdate(
        { clerkId: userId },
        update,
        { new: true, runValidators: true }
    ).exec();

    if (!updatedUser) {
        throw new Error('User not found');
    }

    return updatedUser;
}

export const getUserBySubscriptionIdDB = async (stripeSubscriptionId: string): Promise<UserDocument> => {
    const user = await User.findOne({ stripeSubscriptionId }).exec();

    // if (!user) {
    //     throw new Error('User not found');
    // }

    //TODO: Fix this, for some reason the error is thrown although the user is found

    return user as UserDocument;
}