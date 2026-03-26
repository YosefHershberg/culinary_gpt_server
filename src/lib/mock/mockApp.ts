/**
 * @module mockApp
 * @description Mock express app to simulate the API for running tests
 */

import express, { NextFunction, Request, Response } from 'express';
import api from '../../api/routes';

// Mock userId
export const userId = 'user_2jxrTsY1k326x1dFgPFmr2OpMbV'

const app = express();

app.use(express.json());

/**
 * Middleware to add user to request object
 */
app.use('/api', (req: Request, _res: Response, next: NextFunction) => {
    req.user = { id: userId } as any;
    next();
}, api)


export default app;
