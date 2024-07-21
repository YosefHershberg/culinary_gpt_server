import { Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import User from '../models/user.model';

import CustomRequest from '../../interfaces/CustomRequest';

export const getKitchenUtils = async (req: CustomRequest, res: Response) => {
    try {
        const user = await User.findOne({ clerkId: req.userId });
        if (!user) {
            throw new Error('User not found');
        }
        return res.json(user.kitchenUtils);
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
        const user: any = await User.findOne({ clerkId: req.userId });
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.kitchenUtils) {
            user.kitchenUtils = {}; // Initialize if not exists
        }

        user.kitchenUtils[name] = value;
        await user.save();
        return res.json({ message: 'Kitchen utilities updated successfully' });
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while updating Kitchen Utils' });

    }
};

