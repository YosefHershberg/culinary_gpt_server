import { Response, Request, NextFunction } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { ingredientOperations, userIngredientOperations } from '../services/ingredients.service';
import { IngredientDocument } from '../models/ingredient.model';

import CustomRequest from '../../interfaces/CustomRequest';
import { Ingredient } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';

import { HttpError } from '../../lib/HttpError';
import { ingredientSchema, doSomethingByIdSchema } from '../validations';

export const getIngredients = async (req: CustomRequest, res: Response<Ingredient[]>, next: NextFunction) => {
    try {
        const ingredients = await userIngredientOperations.getAll(req.userId as string);

        return res.json(ingredients);
    } catch (error: any) {
        console.log(error.message);
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error acoured while fetching your ingredients'));
    }
};

export const addIngredientSchema = z.object({
    body: ingredientSchema
});

export const addIngredient = async (req: CustomRequest, res: Response<Ingredient>, next: NextFunction) => {
    const ingredient = req.body;

    try {
        const newIngredient =
            await userIngredientOperations.addIngredient(req.userId as string, ingredient.id, ingredient.name);

        return res.json(newIngredient);
    } catch (error: any) {
        console.log(error.message);
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error acoured while adding your ingredient'));
    }
};

export const deleteIngredient = async (req: CustomRequest, res: Response<MessageResponse>, next: NextFunction) => {
    const id = req.params.id;

    try {
        const message = await userIngredientOperations.deleteIngredient(req.userId as string, id);

        return res.json(message);
    } catch (error: any) {
        console.log(error.message);
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error acoured while deleting your ingredient'));
    }
};

export const ingredientSuggestionsSchema = z.object({
    params: z.object({
        category: z.enum(['common', 'vegetables', 'dairy', 'spices', 'carbs', 'meat']),
    }),
});

export const ingredientSuggestions = async (req: Request, res: Response<IngredientDocument[]>, next: NextFunction) => {
    const { category } = req.params;

    try {
        const result = await ingredientOperations.getByCategory(category);

        return res.json(result);
    } catch (error: any) {
        console.log(error.message);
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error acoured while fetching ingredients'));
    }
}

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
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error acoured while searching ingredients'));
    }

};

export default searchIngredients;


export { doSomethingByIdSchema }
