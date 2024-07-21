import express from 'express';

import { validate } from '../../middlewares';

import * as recipesController from '../controllers/recipes.controller';

import MessageResponse from '../../interfaces/MessageResponse';

const router = express.Router();

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
    '/recipes/:id',
    validate(recipesController.doSomethingByIdSchema),
    recipesController.deleteRecipe
);

export default router;