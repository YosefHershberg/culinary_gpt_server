import { Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { recipeOperations } from '../services/recipes.service';

import CustomRequest from '../../interfaces/CustomRequest';
import { doSomethingByIdSchema, recipeSchema } from '../validations';
import { createRecipeOperations } from '../services/createRecipe.service';

export const getRecipes = async (req: CustomRequest, res: Response) => {
    try {
        const recipes = await recipeOperations.getAll(req.userId as string);

        return res.json(recipes);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while getting your recipes' });
    }
}

export const addRecipeSchema = z.object({
    body: z.object({
        recipe: recipeSchema
    })
});

export const addRecipe = async (req: CustomRequest, res: Response) => {
    const recipe = req.body;

    try {
        const newRecipe = await recipeOperations.addRecipe(req.userId as string, recipe);

        return res.json(newRecipe);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while adding recipe' });
    }
}

export const deleteRecipe = async (req: CustomRequest, res: Response) => {
    const id = req.params.id;

    try {
        const message = await recipeOperations.deleteRecipe(req.userId as string, id);

        return res.json({ message });
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while deleting recipe' });
    }
}

export const getRecipe = async (req: CustomRequest, res: Response) => {
    const id = req.params.id;

    try {
        const recipe = await recipeOperations.getRecipe(id);

        return res.json(recipe);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while getting your recipe' });
    }
}

export const createRecipeSchema = z.object({
    body: z.object({
        mealSelected: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']),
        selectedTime: z.number().min(5).max(180),
        prompt: z.string(),
        numOfPeople: z.number().min(1).max(99),
    }),
});

export const createRecipe = async (req: CustomRequest, res: Response) => {

    try {
        const recipe = await createRecipeOperations.createRecipe(req.userId as string, req.body);
        return res.json(recipe);
    } catch (error) {
        console.log(error);
        let message = 'Error accourd while genarating the recipe';
        if (error instanceof Error) {
            message = error.message;
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message });
    }

}

export { doSomethingByIdSchema }