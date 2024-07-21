import { Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import CustomRequest from '../../interfaces/CustomRequest';
import { ingredientOperations } from '../services/ingredients.service';

export const searchIngredientsSchema = z.object({
    query: z.object({
        query: z.string(),
    })
});

const searchIngredients = async (req: CustomRequest, res: Response) => {
    const { query } = req.query;

    try {
        const ingredients = await ingredientOperations.search(query as string);
        return res.json(ingredients);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while searching' });
    }

};

export default searchIngredients;
