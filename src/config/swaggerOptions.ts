import { version } from '../../package.json';
import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CulinaryGPT',
            version,
            description: `This is a Node.js Express server application built with TypeScript that generates recipes using the Gemini API.
                It uses MongoDB as the main database, firebase for image storage, zod for validation and Clerk for authentication.`,
        },
        servers: [
            {
                url: 'http://localhost:5000',
            },
            {
                url: 'https://culinarygptserver-production.up.railway.app',
            }
        ],
    },
    apis: ['src/api/**/*.ts'],
};