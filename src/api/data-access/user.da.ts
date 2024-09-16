import { kitchenUtils } from "../../lib/data/kitchenUtils";
import User, { UserDocument } from "../models/user.model";

export const getUserDB = async (userId: string): Promise<UserDocument> => {
    const user = await User.findOne({ clerkId: userId }).exec();

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

export interface CreateUserDBProps {
    clerkId: string;
    first_name: string;
    last_name: string;
    email: string;
}

export const createUserDB = async (userData: CreateUserDBProps): Promise<UserDocument> => {
    const user = new User({
        ...userData,
        kitchenUtils: kitchenUtils
    });
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

export interface UpdateUserDBProps {
    first_name: string
    last_name: string,
    email: string,
}


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