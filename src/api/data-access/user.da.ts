import { kitchenUtils } from "../../data/kitchenUtils";
import User from "../models/user.model";

//TODO: Add return types

export const getUserDB = async (userId: string) => {
    const user = await User.findOne({ clerkId: userId });

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

export const createUserDB = async ({ clerkId, first_name, last_name, email }: CreateUserDBProps) => {
    const user = new User({
        clerkId,
        first_name,
        last_name,
        email,
        kitchenUtils: kitchenUtils
    });
    const newUser = await user.save()

    return newUser;
}

export const deleteUserDB = async (userId: string) => {
    const user = await User.findOneAndDelete({ clerkId: userId });

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


export const updateUserDB = async (userId: string, update: UpdateUserDBProps) => {
    const updatedUser = await User.findOneAndUpdate(
        { clerkId: userId },
        update,
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        throw new Error('User not found');
    }

    return updatedUser;
}