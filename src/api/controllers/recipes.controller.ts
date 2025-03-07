import { NextFunction, Response } from 'express';
import { z } from 'zod';
import { HttpStatusCode } from 'axios';

import recipeServices from '../services/recipes.service';
import createRecipeServices from '../services/createRecipe.service';
import createCocktailServices from '../services/createCocktail.service';

import { CustomRequest, MessageResponse, FilterOptions, SortOptions } from '../../types';

import { recipeSchema } from '../schemas/recipe.schema';
import { RecipeDocument } from '../models/recipe.model';
import { HttpError } from '../../lib/HttpError';
import logger from '../../config/logger';
import { returnStreamData } from '../../utils/helperFunctions';

/**
 * @openapi
 * /api/user/recipes:
 *   get:
 *     summary: Retrieve all recipes for the authenticated user
 *     description: Fetches a paginated list of recipes that belong to the currently authenticated user.
 *     tags:
 *       - User Recipes
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *           description: The number of recipes to retrieve per page.
 *       - in: query
 *         name: query
 *         required: false
 *         schema:
 *           type: string
 *           description: Optional search query to filter recipes.
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *           type: string
 *           enum: [recipes, cocktails, all]
 *           description: Filter recipes by type.
 *       - in: query
 *         name: sort
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['newest', 'oldest', 'a-z', 'z-a']
 *           description: Filter recipes by type.
 *     responses:
 *       200:
 *         description: A paginated list of recipes belonging to the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: An error occurred while fetching recipes.
 */

export const getRecipesSchema = z.object({
    query: z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
        query: z.string().optional(),
        filter: z.enum(['recipes', 'cocktails', 'all']),
        sort: z.enum(['newest', 'oldest', 'a-z', 'z-a']),
    }),
});

export const getRecipes = async (req: CustomRequest, res: Response<RecipeDocument[] | MessageResponse>, next: NextFunction) => {

    try {
        const recipes = await recipeServices.getUserPageRecipes({
            userId: req.userId as string,
            page: Number(req.query.page),
            limit: Number(req.query.limit),
            query: req.query.query as string,
            filter: req.query.filter as FilterOptions,
            sort: req.query.sort as SortOptions
        });

        return res.json(recipes);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(HttpStatusCode.InternalServerError, 'An error accrued while fetching your recipes'));
    }
}

/**
 * @openapi
 * /api/user/recipes:
 *   post:
 *     summary: Add a new recipe for the authenticated user
 *     description: Creates a new recipe with an associated image URL and assigns it to the currently authenticated user.
 *     tags:
 *       - User Recipes
 *     requestBody:
 *       description: The recipe data to create, including the recipe details and an image URL.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipe:
 *                 $ref: '#/components/schemas/Recipe'
 *               image_url:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       200:
 *         description: The created recipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Bad request - invalid input data
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: An error occurred while adding the recipe
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
        const newRecipe = await recipeServices.addRecipe({ ...recipe, userId: req.userId as string });

        return res.json(newRecipe);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(HttpStatusCode.InternalServerError, 'An error accrued while adding your recipe'));
    }
}

/**
 * @openapi
 * /api/user/recipes/{id}:
 *   get:
 *     summary: Retrieve a specific recipe by ID
 *     description: Fetches the details of a specific recipe using its unique ID.
 *     tags:
 *       - User Recipes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the recipe to retrieve
 *     responses:
 *       200:
 *         description: The details of the specified recipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Bad request - invalid recipe ID
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: An error occurred while fetching the recipe
 */

export const getRecipeById = async (req: CustomRequest, res: Response<RecipeDocument>, next: NextFunction) => {
    const id = req.params.id;

    try {
        const recipe = await recipeServices.getRecipeById(id);

        return res.json(recipe);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(HttpStatusCode.InternalServerError, 'An error accrued while fetching your recipe'));
    }
}

/**
 * @openapi
 * /api/user/recipes/{id}:
 *   delete:
 *     summary: Delete a specific recipe by ID
 *     description: Deletes a specific recipe using its unique ID.
 *     tags:
 *       - User Recipes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the recipe to retrieve
 *     responses:
 *       200:
 *         description: The details of the specified recipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Bad request - invalid recipe ID
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: An error occurred while fetching the recipe
 */

export const deleteRecipe = async (req: CustomRequest, res: Response<MessageResponse>, next: NextFunction) => {
    const recipeId = req.params.id;

    try {
        const message = await recipeServices.deleteRecipe(recipeId);

        return res.json(message);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(HttpStatusCode.InternalServerError, 'An error accrued while deleting your recipe'));
    }
}

/**
 * @openapi
 * /api/user/recipes/create:
 *   get:
 *     summary: Create a new recipe
 *     description: Generate a new recipe based on user input using OpenAI API.
 *     tags:
 *       - User Recipes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mealSelected:
 *                 type: string
 *                 enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']
 *                 example: 'dinner'
 *                 description: "The type of meal for which the recipe will be created."
 *               selectedTime:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 180
 *                 example: 30
 *                 description: "Time in minutes available to prepare the recipe."
 *               prompt:
 *                 type: string
 *                 example: 'Create a quick and easy chicken dinner recipe'
 *                 description: "The prompt describing the desired recipe."
 *                 maximum: 100
 *               numOfPeople:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 99
 *                 example: 4
 *                 description: "The number of people the recipe should serve."
 *     responses:
 *       200:
 *         description: Recipe successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recipe:
 *                   $ref: '#/components/schemas/Recipe'
 *                 image_url:
 *                   type: string
 *                   example: "https://example.com/image.jpg"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: "Error message"
 *                   example: 'An error occurred while creating your recipe'
 */

export const createRecipeSchema = z.object({
    body: z.object({
        mealSelected: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']),
        selectedTime: z.number().min(5).max(120),
        prompt: z.string().max(100),
        numOfPeople: z.number().min(1).max(99),
    }),
});

export const createRecipe = async (req: CustomRequest, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client

    try {
        await createRecipeServices.createRecipe(req.userId as string, req.body, res);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error creating recipe: ${error.message}`);
        }
        returnStreamData(res, {
            event: 'error',
            payload: error
        });
        res.end()
        next(new HttpError(HttpStatusCode.InternalServerError, 'An error accrued while creating your recipe'));
    }

    res.on('close', () => {
        return res.end();
    });

    return res.end()
}

/**
 * @openapi
 * /api/user/recipes/create-cocktail:
 *   post:
 *     summary: Create a new cocktail recipe
 *     description: Generate a new cocktail recipe based on user input using OpenAI API.
 *     tags:
 *       - User Recipes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: 'Create a quick and easy chicken dinner recipe'
 *                 description: "The prompt describing the desired recipe."
 *     responses:
 *       200:
 *         description: Recipe successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recipe:
 *                   $ref: '#/components/schemas/Recipe'
 *                 image_url:
 *                   type: string
 *                   example: "https://example.com/image.jpg"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: "Error message"
 *                   example: 'An error occurred while creating your recipe'
 */

export const createCocktailSchema = z.object({
    body: z.object({
        prompt: z.string(),
    }),
});

export const createCocktail = async (req: CustomRequest, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client

    try {
        await createCocktailServices.createCocktail(req.userId as string, req.body, res);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        returnStreamData(res, {
            event: 'error',
            payload: error
        });
        res.end()
        next(new HttpError(HttpStatusCode.InternalServerError, 'An error accrued while creating your cocktail'));
    }

    res.on('close', () => {
        return res.end();
    });

    return res.end()
}