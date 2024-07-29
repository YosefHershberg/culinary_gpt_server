import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from "body-parser";

import * as middlewares from './middlewares';
import api from './api';

import clerkWebhook from './api/webhooks/clerkWebhook';
import rateLimiter from './lib/rateLimit';
import env from './lib/env';

const app = express();

app.use(morgan('dev'));
app.use(helmet());

app.use(cors({
  origin: env.NODE_ENV === 'production' ? env.CORS_ORIGIN : true,
}));

app.use(rateLimiter)

app.post(
  "/api/webhooks",
  bodyParser.raw({ type: "application/json" }),
  clerkWebhook
);

app.use(express.json());

app.use('/api', middlewares.authMiddleware, api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
