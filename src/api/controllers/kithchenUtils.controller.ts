import { Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import User from '../models/user.model';
import { kitchenUtilsOperations } from '../services/kithchenUtils.service';

import CustomRequest from '../../interfaces/CustomRequest';

export const getKitchenUtils = async (req: CustomRequest, res: Response) => {
    try {
        const kitchenUtils = await kitchenUtilsOperations.get(req.userId as string);
        
        return res.json(kitchenUtils);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while getting Kitchen Utils' });
    }
};

export const updateKitchenUtilsSchema = z.object({
    body: z.object({
        name: z.enum(['Stove Top', 'Oven', 'Microwave', 'Air Fryer', 'Blender', 'Food Processor', 'Slow Cooker', 'BBQ', 'Grill']),
        value: z.boolean()
    })
});

export const updateKitchenUtils = async (req: CustomRequest, res: Response) => {
    const { name, value } = req.body;

    try {
        const message =
            await kitchenUtilsOperations.update(req.userId as string, name, value);

        return res.json({ message });
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while updating Kitchen Utils' });

    }
};

