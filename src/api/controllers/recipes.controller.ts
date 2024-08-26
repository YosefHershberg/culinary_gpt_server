import { NextFunction, Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { RecipeDocument } from '../models/recipe.model';
import { recipeOperations } from '../services/recipes.service';
import { createRecipeOperations } from '../services/createRecipe.service';

import CustomRequest from '../../interfaces/CustomRequest';
import { RecipeWithImage } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';

import { doSomethingByIdSchema } from '../schemas';
import { recipeSchema } from '../schemas/recipe.schema';
import { HttpError } from '../../lib/HttpError';
import logger from '../../config/logger';

/**
 * @openapi
 * /api/user/recipes:
 *  get:
 *     tags:
 *     - User Recipes
 *     description: Gets all user recipes
 *     responses:
 *       200:
 *         description: App is up and running
 *       400:
 *         description: Bad request
 */
export const getRecipes = async (req: CustomRequest, res: Response<RecipeDocument[] | MessageResponse>, next: NextFunction) => {
    try {
        const recipes = await recipeOperations.getUserRecipes(req.userId as string);

        return res.json(recipes);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error accrued while fetching your recipes'));
    }
}

/**
 * @openapi
 * /api/user/recipes:
 *  post:
 *     tags:
 *     - User Recipes
 *     description: Adds a new recipe to the user's list
 *     responses:
 *       200:
 *         description: App is up and running
 *       400:
 *         description: Bad request
 */
export const addRecipeSchema = z.object({
    body: z.object({
        recipe: recipeSchema,
        image_url: z.string()
    })
});

export const addRecipe = async (req: CustomRequest, res: Response<RecipeDocument>, next: NextFunction) => {
    const recipe = req.body;

    try {
        const newRecipe = await recipeOperations.addRecipe({ ...recipe, userId: req.userId as string });

        return res.json(newRecipe);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error accrued while adding your recipe'));
    }
}

/**
 * @openapi
 * /api/user/recipes/{id}:
 *  get:
 *     tags:
 *     - User Recipes
 *     description: Gets a user recipe by id
 *     responses:
 *       200:
 *         description: App is up and running
 *       400:
 *         description: Bad request
 */
export const getRecipe = async (req: CustomRequest, res: Response<RecipeDocument>, next: NextFunction) => {
    const id = req.params.id;

    try {
        const recipe = await recipeOperations.getRecipe(id);

        return res.json(recipe);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error accrued while fetching your recipe'));
    }
}

/**
 * @openapi
 * /api/user/recipes/{id}:
 *  delete:
 *     tags:
 *     - User Recipes
 *     description: Deletes a user recipe by id
 *     responses:
 *       200:
 *         description: App is up and running
 *       400:
 *         description: Bad request
 */
export const deleteRecipe = async (req: CustomRequest, res: Response<MessageResponse>, next: NextFunction) => {
    const id = req.params.id;

    try {
        const message = await recipeOperations.deleteRecipe(req.userId as string, id);

        return res.json(message);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error accrued while deleting your recipe'));
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

/**
 * @openapi
 * /api/user/recipes/create:
 *  post:
 *     tags:
 *     - User Recipes
 *     description: Creates a new recipe
 *     responses:
 *       200:
 *         description: App is up and running
 *       400:
 *         description: Bad request
 */
export const createRecipe = async (req: CustomRequest, res: Response<RecipeWithImage>, next: NextFunction) => {

    try {
        const recipe = await createRecipeOperations.createRecipe(req.userId as string, req.body);

        return res.json(recipe);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error accrued while creating your recipe'));
    }

}

export { doSomethingByIdSchema }