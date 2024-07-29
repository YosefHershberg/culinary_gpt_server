import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from "body-parser";
import * as dotenv from 'dotenv';

import * as middlewares from './middlewares';
import api from './api';

import clerkWebhook from './api/webhooks/clerkWebhook';
import rateLimiter from './lib/rateLimit';

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : true,
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
