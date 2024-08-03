import { NextFunction, Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { kitchenUtilsOperations } from '../services/kitchenUtils.service';
import { KitchenUtils } from '../../interfaces';
import CustomRequest from '../../interfaces/CustomRequest';

import { HttpError } from '../../lib/HttpError';
import logger from '../../config/logger';

/**
 * @openapi
 * /api/user/kitchen-utils:
 *  get:
 *     tags:
 *     - User Kitchen Utils
 *     description: Gets all user kitchen utils
 *     responses:
 *       200:
 *         description: App is up and running
 *       400:
 *         description: Bad request
 */
export const getKitchenUtils = async (req: CustomRequest, res: Response<KitchenUtils>, next: NextFunction) => {
    try {
        const kitchenUtils = await kitchenUtilsOperations.get(req.userId as string);

        return res.json(kitchenUtils);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error accrued while fetching Kitchen Utils'));
    }
};

/**
 * @openapi
 * /api/user/kitchen-utils:
 *  patch:
 *     tags:
 *     - User Kitchen Utils
 *     description: Updates a user's kitchen utils
 *     responses:
 *       200:
 *         description: App is up and running
 *       400:
 *         description: Bad request
 */
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
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error accrued while updating Kitchen Utils'));
    }
};

