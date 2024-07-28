import { NextFunction, Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import CustomRequest from '../../interfaces/CustomRequest';
import { ingredientOperations } from '../services/ingredients.service';
import { IngredientDocument } from '../models/ingredient.model';
import { HttpError } from '../../lib/HttpError';

export const searchIngredientsSchema = z.object({
    query: z.object({
        query: z.string(),
    })
});

const searchIngredients = async (req: CustomRequest, res: Response<IngredientDocument[]>, next: NextFunction) => {
    const { query } = req.query;

    try {
        const ingredients = await ingredientOperations.search(query as string);
        
        return res.json(ingredients);
    } catch (error: any) {
        console.log(error.message);
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error acoured while searching for ingredients'));
    }

};

export default searchIngredients;
