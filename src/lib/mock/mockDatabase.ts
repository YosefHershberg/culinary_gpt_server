/**
 * @module mockDatabase
 * @description Mock database to simulate the database for running tests
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const connectToDatabase = async (): Promise<void> => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri).then(() => {
        console.log('Connected to in-memory database');
    });
};

export const closeDatabase = async (): Promise<void> => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop().then(() => {
        console.log('Disconnected & closed in-memory database');
    });
};

export const clearDatabase = async (): Promise<void> => {
    const collections = mongoose.connection.collections;
    const promises = Object.values(collections).map(collection => collection.deleteMany({}));
    await Promise.all(promises);
};
