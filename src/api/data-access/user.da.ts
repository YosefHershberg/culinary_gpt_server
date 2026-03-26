import prisma from "../../config/prisma";
import type { UserModel } from "../../generated/prisma/models";

export type CreateUserDBProps = {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    isSubscribed: boolean;
};

export type UpdateUserDBProps = Partial<Omit<UserModel, 'id' | 'createdAt' | 'updatedAt'>>;

export const getUserDB = async (userId: string): Promise<UserModel> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

export const createUserDB = async (userData: CreateUserDBProps): Promise<UserModel> => {
    const user = await prisma.user.create({
        data: {
            id: userData.userId,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            isSubscribed: userData.isSubscribed,
        },
    });

    return user;
}

export const deleteUserDB = async (userId: string): Promise<UserModel> => {
    const user = await prisma.user.delete({ where: { id: userId } });

    return user;
}

export const updateUserDB = async (userId: string, update: UpdateUserDBProps): Promise<UserModel> => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: update,
    });

    return user;
}

export const getUserBySubscriptionIdDB = async (stripeSubscriptionId: string): Promise<UserModel> => {
    const user = await prisma.user.findFirst({ where: { stripeSubscriptionId } });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}
