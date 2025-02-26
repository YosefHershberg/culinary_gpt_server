import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { HttpStatusCode } from 'axios';

import clerkClient from './config/clerkClient';
import { HttpError } from './lib/HttpError';
import env from './utils/env';

import ErrorResponse from './types/ErrorResponse';
import CustomRequest from './types/CustomRequest';
import logger from './config/logger';

export const authMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(HttpStatusCode.Unauthorized);
    next(new Error('Unauthorized. No token provided'));
  }

  try {
    const client = await clerkClient.verifyToken(token as string);

    if (!req.userId) req.userId = client.sub;
    next()
  } catch (error) {
    logger.error(error);
    res.status(HttpStatusCode.Unauthorized);
    next(new Error('Unauthorized. Invalid token'));
  }
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(HttpStatusCode.NotFound);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response<ErrorResponse>, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  
  // catching errors that are not HttpError
  const statusCode = res.statusCode !== HttpStatusCode.Ok ? res.statusCode : HttpStatusCode.Ok;
  res.status(statusCode);
  return res.json({
    message: err.message,
    stack: env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}

// NOTE: This function will return a middleware function
export const validate = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    next();
  } catch (error: any) {
    logger.error(error.errors)
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((issue: any) => ({
        message: `${issue.path.join('.')} is ${issue.message}`,
      }))
      return res.status(HttpStatusCode.BadRequest).json({ error: 'Invalid data', details: errorMessages });
    } else {
      return res.status(HttpStatusCode.InternalServerError).json({ error: 'Internal Server Error' });
    }

  }
}