import { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { swaggerOptions } from '../config/swaggerOptions';
import logger from '../config/logger';
import env from '../config/env';

/**
 * @module swagger
 * @description This module provides the Swagger documentation for the API
 * @exports swagger
 */

export const swagger = (app: Express) => {
    const specs = swaggerJsdoc(swaggerOptions);

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

    app.get('/docs.json', (_req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });

    logger.info(`Docs available at http://localhost:${env.PORT}/docs`);

    return app;

}

export default swagger;