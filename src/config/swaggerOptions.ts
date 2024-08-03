import { version } from '../../package.json';
import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CulinaryGPT',
            version,
            description: 'This is a REST API server for CulinaryGPT, a recipe generation application',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['src/api/**/*.ts'],
};