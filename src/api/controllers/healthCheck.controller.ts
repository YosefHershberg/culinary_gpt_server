import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

export const healthCheck = async (_req: Request, res: Response) => {
    return res.status(HttpStatusCode.Ok).json({
        status: 'ok1',
    });
};