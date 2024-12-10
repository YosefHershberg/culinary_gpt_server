/**
 * @module router
 * @description This module provides the routes for the API
 * @exports router
 */

import express from 'express';

import userIngredientRoutes from './userIngredients.routes';
import kitchenUtilsRoutes from './kitchenUtils.routes';
import recipesRoutes from './recipes.routes';
import ingredientsRoutes from './ingredients.routes';


const router = express.Router();

router.use(
    '/user/ingredients',
    userIngredientRoutes
)

router.use(
    '/user/kitchen-utils',
    kitchenUtilsRoutes
)

router.use(
    '/user/recipes',
    recipesRoutes
)

router.use(
    '/ingredients',
    ingredientsRoutes
)

export default router;
