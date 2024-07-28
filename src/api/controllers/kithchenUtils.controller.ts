import { NextFunction, Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { kitchenUtilsOperations } from '../services/kithchenUtils.service';

import CustomRequest from '../../interfaces/CustomRequest';
import { KitchenUtils } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';
import { HttpError } from '../../lib/HttpError';

export const getKitchenUtils = async (req: CustomRequest, res: Response<KitchenUtils>, next: NextFunction) => {
    try {
        const kitchenUtils = await kitchenUtilsOperations.get(req.userId as string);

        return res.json(kitchenUtils);
    } catch (error: any) {
        console.log(error.message);
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error acoured while fetching Kitchen Utils'));
    }
};

export const updateKitchenUtilsSchema = z.object({
    body: z.object({
        name: z.enum(['Stove Top', 'Oven', 'Microwave', 'Air Fryer', 'Blender', 'Food Processor', 'Slow Cooker', 'BBQ', 'Grill']),
        value: z.boolean()
    })
});

export const updateKitchenUtils = async (req: CustomRequest, res: Response<KitchenUtils>, next: NextFunction) => {
    const { name, value } = req.body;

    try {
        const message =
            await kitchenUtilsOperations.update(req.userId as string, name, value);

        return res.json(message);
    } catch (error: any) {
        console.log(error.message);
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error acoured while updating Kitchen Utils'));
    }
};

