/**
 * @module mockApp
 * @description Mock express app to simulate the API for running tests
 */

import express, { NextFunction, Response } from 'express';
import api from '../../api';
import CustomRequest from '../../interfaces/CustomRequest';

// Mock userId
export const userId = 'user_2jxrTsY1k326x1dFgPFmr2OpMbV'

const app = express();

app.use(express.json());

/**
 * Middleware to add userId to request object
 */
app.use('/api', (req: CustomRequest, res: Response, next: NextFunction) => {
    req.userId = userId;
    next();
}, api)


export default app;