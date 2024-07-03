import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from "body-parser";

import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './interfaces/MessageResponse';

import { clerkWebhooks } from './utils/webhooks';

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : true,
}));

app.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.post(
  "/api/webhooks",
  bodyParser.raw({ type: "application/json" }),
  clerkWebhooks
);

app.use(express.json());

app.use('/api', middlewares.authMiddleware, api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
