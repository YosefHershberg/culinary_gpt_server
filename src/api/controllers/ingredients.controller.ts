import { Response, Request, NextFunction } from 'express';
import { FilterQuery } from 'mongoose';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import CustomRequest from '../../interfaces/CustomRequest';
import { UserIngredient } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';

import { ingredientOperations, userIngredientOperations } from '../services/ingredients.service';
import { IngredientDocument } from '../models/ingredient.model';

import { HttpError } from '../../lib/HttpError';
import { doSomethingByIdSchema } from '../schemas';
import { ingredientSchema } from '../schemas/ingredient.schema';
import logger from '../../config/logger';

/**
 * @openapi
 * /api/user/ingredients:
 *  get:
 *     tags:
 *     - User Ingredients
 *     summary: Retrieves all ingredients for the user
 *     responses:
 *       200:
 *         description: Successfully retrieved all user ingredients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

export const getIngredients = async (req: CustomRequest, res: Response<UserIngredient[]>, next: NextFunction) => {
    try {
        const ingredients = await userIngredientOperations.getAll(req.userId as string);

        return res.json(ingredients);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'An error accrued while fetching your ingredients'
        ));
    }
};

/**
 * @openapi
 * /api/user/ingredients:
 *  post:
 *     tags:
 *     - User Ingredients
 *     summary: Adds a new ingredient to the user's list
 *     requestBody:
 *        required: true
 *        content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/Ingredient'
 *     responses:
 *       200:
 *         description: Ingredient deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

export const addIngredientSchema = z.object({
    body: ingredientSchema
});

export const addIngredient = async (req: CustomRequest, res: Response<UserIngredient>, next: NextFunction) => {
    const ingredient = req.body;

    try {
        const newIngredient =
            await userIngredientOperations.addIngredient(req.userId as string, ingredient.id, ingredient.name);

        return res.json(newIngredient);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'An error accrued while adding your ingredient'
        ));
    }
};

/**
 * @openapi
 * /api/user/ingredients/{id}:
 *  delete:
 *     tags:
 *     - User Ingredients
 *     summary: Deletes an ingredient from the user's list
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the ingredient to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ingredient deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Ingredient not found
 *       500:
 *         description: Internal server error
 */

export const deleteIngredient = async (req: CustomRequest, res: Response<MessageResponse>, next: NextFunction) => {
    const id = req.params.id;

    try {
        const message = await userIngredientOperations.deleteIngredient(req.userId as string, id);

        return res.json(message);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'An error accrued while deleting your ingredient'
        ));
    }
};

/**
 * @openapi
 * /user/ingredients/suggestions/{category}:
 *  get:
 *     tags:
 *     - Ingredients
 *     summary: Retrieves ingredient suggestions based on the specified category
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         description: The category of ingredients to query
 *         schema:
 *           type: string
 *           enum: [common, vegetables, dairy, spices, carbs, meat]
 *     responses:
 *       200:
 *         description: Successfully retrieved ingredients for the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

export const ingredientSuggestionsSchema = z.object({
    params: z.object({
        category: z.enum(['common', 'vegetables', 'dairy', 'spices', 'carbs', 'meat']),
    }),
});

export const ingredientSuggestions = async (req: Request, res: Response<IngredientDocument[]>, next: NextFunction) => {
    const { category } = req.params;

    try {
        const result = await ingredientOperations.getByCategory(category as string);

        return res.json(result);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'An error accrued while fetching ingredients'
        ));
    }
}

/**
 * @openapi
 * /api/ingredients/search:
 *  get:
 *     tags:
 *     - Ingredients
 *     summary: Queries ingredients by substring
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: The substring to search for in ingredient names
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved matching ingredients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */


export const searchIngredientsSchema = z.object({
    query: z.object({
        query: z.string(),
    })
});

const searchIngredients = async (req: CustomRequest, res: Response<IngredientDocument[]>, next: NextFunction) => {
    const { query } = req.query;

    try {
        const ingredients = await ingredientOperations.search(query as FilterQuery<IngredientDocument>);

        return res.json(ingredients);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'An error accrued while searching ingredients'
        ));
    }

};

export default searchIngredients;

export { doSomethingByIdSchema }
