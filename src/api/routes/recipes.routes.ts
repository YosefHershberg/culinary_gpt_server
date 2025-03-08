import express from 'express';

import { validate } from '../../middlewares';

import * as recipesController from '../controllers/recipes.controller';

import { MessageResponse, RecipeWithImage } from '../../types';
import { doSomethingByIdSchema } from '../schemas';

const router = express.Router();

router.post(
    '/create',
    validate(recipesController.createRecipeSchema),
    recipesController.createRecipe
);

router.post(
    '/create-cocktail',
    validate(recipesController.createCocktailSchema),
    recipesController.createCocktail
);

router.get<{}, RecipeWithImage[] | MessageResponse>(
    '/',
    validate(recipesController.getRecipesSchema),
    recipesController.getRecipes
);

router.post<{}, RecipeWithImage | MessageResponse>(
    '/',
    validate(recipesController.addRecipeSchema),
    recipesController.addRecipe
);

router.get<{ id: string }, RecipeWithImage | MessageResponse>(
    '/:id',
    validate(doSomethingByIdSchema),
    recipesController.getRecipeById
);

router.delete<{ id: string }, MessageResponse>(
    '/:id',
    validate(doSomethingByIdSchema),
    recipesController.deleteRecipe
);

export default router;