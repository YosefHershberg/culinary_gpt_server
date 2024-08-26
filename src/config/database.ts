import mongoose from 'mongoose';
import env from './env';
import logger from './logger';

export const connectToDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        logger.info('Connected to the database');
    } catch (error) {
        logger.error('Failed to connect to the database:', error);
    }
};

export const disconnectFromDatabase = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        logger.info('Disconnected from the database');
    } catch (error) {
        logger.error('Failed to disconnect from the database:', error);
    }
};