/**
 * @module router
 * @description This module provides the routes for the API
 * @exports router
 */

import express from 'express';

import { validate } from '../../middlewares';

import ingredientRoutes from './ingredients.routes';
import kitchenUtilsRoutes from './kitchenUtils.routes';
import recipesRoutes from './recipes.routes';

import { ingredientSuggestions, ingredientSuggestionsSchema } from '../controllers/ingredients.controller';
import searchIngredients, { searchIngredientsSchema } from '../controllers/ingredients.controller';

const router = express.Router();

router.use(
    '/user/ingredients',
    ingredientRoutes
)

router.use(
    '/user/kitchen-utils',
    kitchenUtilsRoutes
)

router.use(
    '/user/recipes',
    recipesRoutes
)

router.get(
    '/ingredients/suggestions/:category',
    validate(ingredientSuggestionsSchema),
    ingredientSuggestions
);


router.get(
    '/ingredients/search',
    validate(searchIngredientsSchema),
    searchIngredients
);

export default router;
