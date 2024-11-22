import { Response, Request, NextFunction } from 'express';
import { FilterQuery } from 'mongoose';
import { z } from 'zod';
import { HttpStatusCode } from 'axios';

import CustomRequest from '../../interfaces/CustomRequest';
import { IngredientType, PartialUserIngredientResponse as PartialIngredient } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';

import { ingredientOperations, userIngredientOperations } from '../services/ingredients.service';
import { IngredientDocument } from '../models/ingredient.model';
import { HttpError } from '../../lib/HttpError';
import { ingredientSchema } from '../schemas/ingredient.schema';
import logger from '../../config/logger';

/**
 * @openapi
 * /api/user/ingredients:
 *  get:
 *     tags:
 *     - User Ingredients
 *     summary: Retrieves all ingredients for the user
 *     description: Fetches a list of ingredients that belong to the currently authenticated user.
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

export const getIngredients = async (req: CustomRequest, res: Response<PartialIngredient[]>, next: NextFunction) => {
    try {
        const ingredients = await userIngredientOperations.getAll(req.userId as string);

        return res.json(ingredients);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(
            HttpStatusCode.InternalServerError,
            'An error accrued while fetching your ingredients'
        ));
    }
};

/**
 * @openapi
 * paths:
 *   /api/user/ingredients:
 *     post:
 *       tags:
 *         - User Ingredients
 *       summary: Adds a new ingredient to the user's list
 *       description: Adds a new ingredient to the user's list
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       responses:
 *         '200':
 *           description: Ingredient added successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Ingredient'
 *         '400':
 *           description: Bad request
 *         '500':
 *           description: Internal server error
 */

export const addIngredientSchema = z.object({
    body: ingredientSchema
});

export const addIngredient = async (req: CustomRequest, res: Response<PartialIngredient>, next: NextFunction) => {
    const ingredient = req.body;

    try {
        const newIngredient =
            await userIngredientOperations.addIngredient({
                userId: req.userId as string,
                ingredientId: ingredient.id,
                name: ingredient.name,
                type: ingredient.type,
            });

        return res.json(newIngredient);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(
            HttpStatusCode.InternalServerError,
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
 *     description: Deletes an ingredient from the user's list
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
            HttpStatusCode.InternalServerError,
            'An error accrued while deleting your ingredient'
        ));
    }
};

/**
 * @openapi
 * /api/user/ingredients/all:
 *   delete:
 *     tags:
 *       - User Ingredients
 *     summary: Deletes all ingredients from the user's list
 *     description: Deletes all ingredients from the user's list
 *     responses:
 *       200:
 *         description: All ingredients deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

export const deleteAllIngredients = async (req: CustomRequest, res: Response<MessageResponse>, next: NextFunction) => {
    try {
        const message = await userIngredientOperations.deleteAll(req.userId as string);

        return res.json(message);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(
            HttpStatusCode.InternalServerError,
            'An error accrued while deleting your ingredients'
        ));
    }
}

/**
 * @openapi
 * /user/ingredients/suggestions/{category}:
 *  get:
 *     tags:
 *     - Ingredients
 *     summary: Retrieves ingredient suggestions based on the specified category
 *     description: Fetches a list of ingredients that belong to the specified category.
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
        category: z.enum(['common', 'vegetables', 'dairy', 'spices', 'carbs', 'meat', 'spirits', 'liqueurs', 'bitters', 'mixers', 'syrups', 'fruits', 'herbs']),
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
            HttpStatusCode.InternalServerError,
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
 *     description: Fetches a list of ingredients that contain the specified substring in their name.
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         description: The substring to search for in ingredient names
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         required: true
 *         description: The type of ingredient (food or drink)
 *         schema:
 *           type: string
 *           enum: 
 *             - food
 *             - drink
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
        type: z.enum(['food', 'drink']),
    })
});

export const searchIngredients = async (req: CustomRequest, res: Response<IngredientDocument[]>, next: NextFunction) => {
    const { query, type } = req.query;

    try {
        const ingredients = await ingredientOperations.search(
            query as FilterQuery<IngredientDocument>,
            type as IngredientType
        );

        return res.json(ingredients);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(
            HttpStatusCode.InternalServerError,
            'An error accrued while searching ingredients'
        ));
    }
};