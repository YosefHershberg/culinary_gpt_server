import express from 'express';

import { validate } from '../../middlewares';

import * as recipesControllers from '../controllers/recipes.controller';

import { type MessageResponse, type RecipeWithImage } from '../../types';
import { doSomethingByIdSchema } from '../schemas';

const router = express.Router();

router.post(
    '/create',
    validate(recipesControllers.createRecipeSchema),
    recipesControllers.createRecipe
);

router.post(
    '/create-cocktail',
    validate(recipesControllers.createCocktailSchema),
    recipesControllers.createCocktail
);

router.get<{}, RecipeWithImage[] | MessageResponse>(
    '/',
    validate(recipesControllers.getRecipesSchema),
    recipesControllers.getRecipes
);

router.post<{}, RecipeWithImage | MessageResponse>(
    '/',
    validate(recipesControllers.addRecipeSchema),
    recipesControllers.addRecipe
);

router.get<{ id: string }, RecipeWithImage | MessageResponse>(
    '/:id',
    validate(doSomethingByIdSchema),
    recipesControllers.getRecipeById
);

router.delete<{ id: string }, MessageResponse>(
    '/:id',
    validate(doSomethingByIdSchema),
    recipesControllers.deleteRecipe
);

export default router;