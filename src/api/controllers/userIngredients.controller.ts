import { HttpStatusCode } from "axios";
import { Response, NextFunction } from "express";
import { z } from "zod";

import logger from "../../config/logger";
import userIngredientServices from "../services/userIngredients.service";

import { CustomRequest, MessageResponse, UserIngredient } from "../../types";
import { HttpError } from "../../lib/HttpError";
import { ingredientSchema } from "../schemas/ingredient.schema";
import { IngredientDocument } from "../models/ingredient.model";

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

export const getAllIngredients = async (req: CustomRequest, res: Response<UserIngredient[]>, next: NextFunction) => {
    try {
        const ingredients = await userIngredientServices.getAll(req.userId as string);

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

export const addIngredient = async (req: CustomRequest, res: Response<UserIngredient>, next: NextFunction) => {
    const ingredient = req.body;

    console.log(ingredient);

    try {
        const newIngredient =
            await userIngredientServices.addIngredient({
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
 * paths:
 *   /api/user/ingredients/multiple:
 *     post:
 *       tags:
 *         - User Ingredients
 *       summary: Adds multiple ingredients to the user's list
 *       description: Adds an array of ingredients to the user's list
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
 *       responses:
 *         '200':
 *           description: Ingredients added successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Ingredient'
 *         '400':
 *           description: Bad request
 *         '500':
 *           description: Internal server error
 */

export const addMultipleIngredientsSchema = z.object({
    body: z.array(ingredientSchema)
});

export const addMultipleIngredients = async (req: CustomRequest, res: Response<UserIngredient[]>, next: NextFunction) => {
    const ingredients: IngredientDocument[] = req.body;

    try {
        const newIngredients = await userIngredientServices.addMultiple(
            req.userId as string,
            ingredients
        );

        return res.json(newIngredients);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(
            HttpStatusCode.InternalServerError,
            'An error accrued while adding your ingredients'
        ));
    }
}

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
        const message = await userIngredientServices.deleteIngredient(req.userId as string, id);

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
        const message = await userIngredientServices.deleteAll(req.userId as string);

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