import express from 'express';

import { validate } from '../../middlewares';

import * as ingredientControllers from '../controllers/ingredients.controller';
import { UserIngredient } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';

const router = express.Router();

router.get<{}, UserIngredient[] | MessageResponse>(
    '/',
    ingredientControllers.getIngredients
);

router.post<{}, UserIngredient | MessageResponse>(
    '/',
    validate(ingredientControllers.addIngredientSchema),
    ingredientControllers.addIngredient
);

router.delete<{ id: string }, MessageResponse>(
    '/all',
    ingredientControllers.deleteAllIngredients
);

router.delete<{ id: string }, MessageResponse>(
    '/:id',
    validate(ingredientControllers.doSomethingByIdSchema),
    ingredientControllers.deleteIngredient
);

export default router;