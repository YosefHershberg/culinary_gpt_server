import { ZodError, ZodSchema } from 'zod';
import { HttpStatusCode } from 'axios';

import { HttpError } from './lib/HttpError';
import env from './utils/env';
import logger from './config/logger';
import { supabaseAdmin } from './config/supabase';

import type { NextFunction, Request, Response } from 'express';
import type { User } from '@supabase/supabase-js';
import type { ErrorResponse } from './types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new HttpError(HttpStatusCode.Unauthorized, 'Missing or invalid authorization header'));
  }

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return next(new HttpError(HttpStatusCode.Unauthorized, 'Invalid or expired token'));
  }

  req.user = user;
  next();
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
  return res.status(HttpStatusCode.InternalServerError).json({
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
