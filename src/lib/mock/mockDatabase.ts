/**
 * @module mockDatabase
 * @description Mock database utilities for running tests with Prisma
 */

import prisma from '../../config/prisma';

export const connectToDatabase = async (): Promise<void> => {
    await prisma.$connect();
    console.log('Connected to test database');
};

export const closeDatabase = async (): Promise<void> => {
    await prisma.$disconnect();
    console.log('Disconnected from test database');
};

export const clearDatabase = async (): Promise<void> => {
    await prisma.userIngredient.deleteMany();
    await prisma.kitchenUtils.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.user.deleteMany();
    await prisma.ingredient.deleteMany();
};
