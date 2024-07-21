import express from 'express';

import { validate } from '../../middlewares';

import * as recipesController from '../controllers/recipes.controller';
import { createRecipe, createRecipeSchema } from '../controllers/recipes.controller';

import MessageResponse from '../../interfaces/MessageResponse';

const router = express.Router();

router.post(
    '/create',
    validate(createRecipeSchema),
    createRecipe
);

router.get<{}, any[]>(
    '/',
    recipesController.getRecipes
);

router.post<{}, any>(
    '/',
    validate(recipesController.addRecipeSchema),
    recipesController.addRecipe
);

router.get<{ id: string }, any>(
    '/:id',
    validate(recipesController.doSomethingByIdSchema),
    recipesController.getRecipe
);

router.delete<{ id: string }, MessageResponse>(
    '/:id',
    validate(recipesController.doSomethingByIdSchema),
    recipesController.deleteRecipe
);

export default router;