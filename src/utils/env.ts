import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string(),
    DATABASE_URL: z.string(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
    GETIMGAI_API_KEY: z.string(),
    GEMINI_API_KEY: z.string(),
    CORS_ORIGIN: z.string().url(),
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