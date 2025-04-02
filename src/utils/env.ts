import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string(),
    CLERK_SECRET_KEY: z.string(),
    CLERK_PUBLISHABLE_KEY: z.string(),
    MONGODB_URI: z.string(),
    WEBHOOK_SECRET: z.string(),
    OPENAI_API_KEY: z.string(),
    GETIMGAI_API_KEY: z.string(),
    GEMINI_API_KEY: z.string(),
    CORS_ORIGIN: z.string().url(),
    FIREBASE_API_KEY: z.string(),
    FIREBASE_AUTH_DOMAIN: z.string(),
    FIREBASE_PROJECT_ID: z.string(),
    FIREBASE_STORAGE_BUCKET: z.string(),
    FIREBASE_MESSAGING_SENDER_ID: z.string(),
    FIREBASE_APP_ID: z.string(),
    FIREBASE_MEASUREMENT_ID: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
});

const parsedResults = envSchema.safeParse(process.env);

if (!parsedResults.success) {
    console.error(parsedResults.error)
    throw new Error('Environment variables are not correctly set')
}

const env = parsedResults.data

export default {...env, NODE_ENV: process.env.NODE_ENV || 'development'};