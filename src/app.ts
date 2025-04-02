import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import * as middlewares from './middlewares';
import api from './api/routes';
import webhooksRouter from './api/routes/webhooks.routes';
import { healthCheck } from './api/controllers/healthCheck.controller';

import rateLimiter from './config/rateLimit';
import env from './utils/env';
import swagger from './utils/swagger';

const app = express();

app.use(morgan('dev'));
app.use(helmet());

swagger(app);

app.set('trust proxy', 1);

app.use(cors({
  origin: env.NODE_ENV === 'production' ? env.CORS_ORIGIN : true,
}));

app.use(rateLimiter);

app.use(
  "/api/webhooks",
  webhooksRouter
);

app.use(express.json());

app.use('/api', middlewares.authMiddleware, api);

app.get('/health', healthCheck);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
