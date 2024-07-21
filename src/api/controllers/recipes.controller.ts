import { Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { recipeOperations } from '../services/recipes.service';

import CustomRequest from '../../interfaces/CustomRequest';
import { doSomethingByIdSchema, recipeSchema } from '../validations';

export const getRecipes = async (req: CustomRequest, res: Response) => {
    try {
        const recipes = await recipeOperations.getAllUserRecipes(req.userId as string);

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

export { doSomethingByIdSchema }