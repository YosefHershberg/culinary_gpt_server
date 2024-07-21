import { Response, Request } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { ingredientOperations, userIngredientOperations } from '../services/ingredients.service';

import CustomRequest from '../../interfaces/CustomRequest';
import { ingredientSchema } from '../validations';
import { doSomethingByIdSchema } from '../validations';

export const getIngredients = async (req: CustomRequest, res: Response) => {
    try {
        const ingredients = await userIngredientOperations.getAll(req.userId as string);

        return res.json(ingredients);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while adding your ingredients' });
    }
};

export const addIngredientSchema = z.object({
    body: ingredientSchema
});

export const addIngredient = async (req: CustomRequest, res: Response) => {
    const ingredient = req.body;

    try {
        const newIngredient =
            await userIngredientOperations.addIngredient(req.userId as string, ingredient);
        return res.json(newIngredient);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while adding your ingredient' });
    }
};

export const deleteIngredient = async (req: CustomRequest, res: Response) => {
    const id = req.params.id;

    try {
        const message = await userIngredientOperations.deleteIngredient(req.userId as string, id);
        return res.json(message);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while deleting your ingredient' });
    }
};

export const ingredientSuggestionsSchema = z.object({
    params: z.object({
        category: z.enum(['common', 'vegetables', 'dairy', 'spices', 'carbs', 'meat']),
    }),
});

export const ingredientSuggestions = async (req: Request, res: Response) => {
    const { category } = req.params;

    try {
        const result = await ingredientOperations.getByCategory(category);
        return res.status(200).json(result);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while fething suggestions' });
    }
}

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


export { doSomethingByIdSchema }
