import { NextFunction, Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { recipeOperations } from '../services/recipes.service';

import CustomRequest from '../../interfaces/CustomRequest';
import { doSomethingByIdSchema, recipeSchema } from '../validations';
import { createRecipeOperations } from '../services/createRecipe.service';
import { RecipeDocument } from '../models/recipe.model';
import MessageResponse from '../../interfaces/MessageResponse';
import { Recipe } from '../../interfaces';
import { HttpError } from '../../lib/HttpError';

export const getRecipes = async (req: CustomRequest, res: Response<RecipeDocument[] | MessageResponse>, next: NextFunction) => {
    try {
        const recipes = await recipeOperations.getAll(req.userId as string);
        
        return res.json(recipes);
    } catch (error: any) {
        console.log(error.message);
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error acoured while fetching your recipes'));
    }
}

export const addRecipeSchema = z.object({
    body: z.object({
        recipe: recipeSchema
    })
});

export const addRecipe = async (req: CustomRequest, res: Response<RecipeDocument | MessageResponse>, next: NextFunction) => {
    const recipe = req.body;

    try {
        const newRecipe = await recipeOperations.addRecipe(req.userId as string, recipe);

        return res.json(newRecipe);
    } catch (error: any) {
        console.log(error.message);
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error acoured while adding your recipe'));
    }
}

export const getRecipe = async (req: CustomRequest, res: Response<RecipeDocument | MessageResponse>, next: NextFunction) => {
    const id = req.params.id;

    try {
        const recipe = await recipeOperations.getRecipe(id);

        return res.json(recipe);
    } catch (error: any) {
        console.log(error.message);
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error acoured while fetching your recipe'));
    }
}

export const deleteRecipe = async (req: CustomRequest, res: Response<MessageResponse>, next: NextFunction) => {
    const id = req.params.id;

    try {
        const message = await recipeOperations.deleteRecipe(req.userId as string, id);

        return res.json(message);
    } catch (error: any) {
        console.log(error.message);
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error acoured while deleting your recipe'));
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

export const createRecipe = async (req: CustomRequest, res: Response<{ recipe: Recipe, image_url: string }>, next: NextFunction) => {

    try {
        const recipe = await createRecipeOperations.createRecipe(req.userId as string, req.body);

        return res.json(recipe);
    } catch (error) {
        console.log(error);
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error acoured while creating your recipe'));
    }

}

export { doSomethingByIdSchema }