import User from "../models/user.model";

//TODO: Add return types

export const getUserDB = async (userId: string) => {
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

export const getUserWithIngredientsDB = async (userId: string) => {
    const user = await User.findOne({ clerkId: userId })
        .populate('ingredients')
        .exec();

    if (!user) {
        throw new Error('User not found');
    }

    return user
}

export const getUserEithRecipesDB = async (userId: string) => {
    const user = await User.findOne({ clerkId: userId })
        .populate('recipes')
        .exec();

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}