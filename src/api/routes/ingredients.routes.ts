import express from 'express';

import { validate } from '../../middlewares';

import * as ingredientControllers from '../controllers/ingredients.controller';
import { UserIngredientResponse } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';
import { doSomethingByIdSchema } from '../schemas';

const router = express.Router();

router.get<{}, UserIngredientResponse[] | MessageResponse>(
    '/',
    ingredientControllers.getIngredients
);

router.post<{}, UserIngredientResponse | MessageResponse>(
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
    validate(doSomethingByIdSchema),
    ingredientControllers.deleteIngredient
);

export default router;