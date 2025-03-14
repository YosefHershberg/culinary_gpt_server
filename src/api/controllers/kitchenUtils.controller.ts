import { z } from 'zod';
import { HttpStatusCode } from 'axios';

import { type NextFunction, type Response } from 'express';
import { type KitchenUtils, type CustomRequest } from '../../types';

import kitchenUtilsServices from '../services/kitchenUtils.service';
import logger from '../../config/logger';
import { HttpError } from '../../lib/HttpError';

/**
 * @openapi
 * /api/user/kitchen-utils:
 *  get:
 *     tags:
 *     - User Kitchen Utils
 *     summary: Gets all user kitchen utils
 *     description: Fetches a list of kitchen utilities that belong to the currently authenticated user.
 * 
 *     responses:
 *       200:
 *         description: Successfully retrieved all user utils
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KitchenUtils'
 *       400:
 *         description: Bad request
 */

export const getKitchenUtils = async (req: CustomRequest, res: Response<KitchenUtils>, next: NextFunction) => {
    try {
        const kitchenUtils = await kitchenUtilsServices.get(req.userId as string);

        return res.json(kitchenUtils);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(HttpStatusCode.InternalServerError, 'An error accrued while fetching Kitchen Utils'));
    }
};

/**
 * @openapi
 * /api/user/kitchen-utils:
 *   patch:
 *     tags:
 *       - User Kitchen Utils
 *     summary: Update a user's kitchen utility
 *     description: Updates the status of a kitchen utility that belongs to the currently authenticated user.
 *     requestBody:
 *       description: Information needed to update the kitchen utility
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 enum: ['Stove Top', 'Oven', 'Microwave', 'Air Fryer', 'Blender', 'Food Processor', 'Slow Cooker', 'BBQ', 'Grill']
 *                 description: The name of the kitchen utility to update.
 *               value:
 *                 type: boolean
 *                 description: The new status of the kitchen utility (true for available, false for unavailable).
 *             required:
 *               - name
 *               - value
 *     responses:
 *       200:
 *         description: Successfully updated the kitchen utility
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Bad request due to invalid input
 *       401:
 *         description: Unauthorized access if authentication fails
 *       500:
 *         description: Internal server error
 */

export const toggleKitchenUtilsSchema = z.object({
    body: z.object({
        name: z.enum(['Stove Top', 'Oven', 'Microwave', 'Air Fryer', 'Blender', 'Food Processor', 'Slow Cooker', 'BBQ', 'Grill']),
    })
});

export const toggleKitchenUtils = async (req: CustomRequest, res: Response<KitchenUtils>, next: NextFunction) => {
    const { name } = req.body;

    try {
        const message =
            await kitchenUtilsServices.toggle(req.userId as string, name);

        return res.json(message);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(HttpStatusCode.InternalServerError, 'An error accrued while updating Kitchen Utils'));
    }
};

