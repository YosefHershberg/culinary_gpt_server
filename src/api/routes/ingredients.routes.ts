import express from 'express';

import { validate } from '../../middlewares';

import * as ingredientControllers from '../controllers/ingredients.controller';
import { Ingredient } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';

const router = express.Router();

router.get<{}, Ingredient[] | MessageResponse>(
    '/',
    ingredientControllers.getIngredients
);

router.post<{}, Ingredient | MessageResponse>(
    '/',
    validate(ingredientControllers.addIngredientSchema),
    ingredientControllers.addIngredient
);

router.delete<{ id: string }, MessageResponse>(
    '/:id',
    validate(ingredientControllers.doSomethingByIdSchema),
    ingredientControllers.deleteIngredient
);

export default router;