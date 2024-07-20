import { Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import CustomRequest from '../../interfaces/CustomRequest';
import Ingredient from '../models/Ingredient';

export const searchIngredientsSchema = z.object({
    query: z.object({
        query: z.string(),
    })
});

const searchIngredients = async (req: CustomRequest, res: Response) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'No query provided' });
    }

    try {
        const ingredients = await Ingredient.find({ name: { $regex: query, $options: 'i' } });
        return res.json(ingredients);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while searching' });
    }

};

export default searchIngredients;
