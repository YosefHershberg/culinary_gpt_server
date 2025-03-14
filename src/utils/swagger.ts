import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { type Express, type Request, type Response } from 'express';

import { swaggerOptions } from '../config/swaggerOptions';
import logger from '../config/logger';
import env from './env';

export const swagger = (app: Express) => {
    const specs = swaggerJsdoc(swaggerOptions);

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

    app.get('/docs.json', (_req: Request, res: Response) => {
        res.send(specs);
    });

    logger.info(`Docs available at http://localhost:${env.PORT}/docs`);

    return app;
}

export default swagger;