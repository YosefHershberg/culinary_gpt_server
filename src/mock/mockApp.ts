import express, { NextFunction, Response } from 'express';
import api from '../api';
import CustomRequest from '../interfaces/CustomRequest';
// import * as middlewares from '../middlewares';

export const userId = 'user_2jxrTsY1k326x1dFgPFmr2OpMbV'

const app = express();

app.use(express.json());

app.use('/api', (req: CustomRequest, res: Response, next: NextFunction) => {
    req.userId = userId;
    next();
}, api)


export default app;