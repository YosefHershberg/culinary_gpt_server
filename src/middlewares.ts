import { NextFunction, Request, Response } from 'express';
import ErrorResponse from './interfaces/ErrorResponse';
import clerkClient from './utils/clerkClient';
import CustomRequest from './interfaces/CustomRequest';

export async function authMiddleware(req: CustomRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401);
    next(new Error('Unauthorized. No token provided'));
  }

  let client;
  try {
    client = await clerkClient.verifyToken(token as string);
    
    if (!req.userId) req.userId = client.sub;
    next()
  } catch (error) {
    console.log(error);
    res.status(401);
    next(new Error('Unauthorized. Invalid token'));
  }
}

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}
