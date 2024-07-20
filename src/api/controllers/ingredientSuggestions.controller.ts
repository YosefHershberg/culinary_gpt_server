import { Request, Response } from 'express';
import Ingredient from '../models/Ingredient';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

const categoryArr = [
    'common',
    'vegetables',
    'dairy',
    'spices',
    'carbs',
    'meat'
] as const;

export const ingredientSuggestionsSchema = z.object({
    params: z.object({
        category: z.enum(categoryArr),
    }),
});

const ingredientSuggestions = async (req: Request, res: Response) => {
    const { category } = req.params;

    try {
        const result = await Ingredient.find({ category })
        return res.status(200).json(result);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while fething suggestions' });
    }
}

export default ingredientSuggestions;