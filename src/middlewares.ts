import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { StatusCodes } from 'http-status-codes';

import clerkClient from './utils/clerkClient';
import ErrorResponse from './interfaces/ErrorResponse';
import CustomRequest from './interfaces/CustomRequest';

export async function authMiddleware(req: CustomRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED);
    next(new Error('Unauthorized. No token provided'));
  }

  let client;
  try {
    client = await clerkClient.verifyToken(token as string);

    if (!req.userId) req.userId = client.sub;
    next()
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.UNAUTHORIZED);
    next(new Error('Unauthorized. Invalid token'));
  }
}

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(StatusCodes.NOT_FOUND);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
  const statusCode = res.statusCode !== StatusCodes.OK ? res.statusCode : StatusCodes.OK;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}

// This function will return a middleware fucntion
export const validate = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {

  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    next();
  } catch (error: any) {
    console.log(error.errors)

    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((issue: any) => ({
        message: `${issue.path.join('.')} is ${issue.message}`,
      }))
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid data', details: errorMessages });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }

  }
}