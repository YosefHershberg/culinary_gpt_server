import express from 'express';

import { validate } from '../../middlewares';

import * as ingredientControllers from '../controllers/ingredients.controller';
import { PartialUserIngredientResponse as PartialIngredient } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';
import { doSomethingByIdSchema } from '../schemas';

const router = express.Router();

router.get<{}, PartialIngredient[] | MessageResponse>(
    '/',
    ingredientControllers.getIngredients
);

router.post<{}, PartialIngredient | MessageResponse>(
    '/',
    validate(ingredientControllers.addIngredientSchema),
    ingredientControllers.addIngredient
);

router.post<{}, PartialIngredient[] | MessageResponse>(
    '/add-multiple',
    validate(ingredientControllers.addMultipleIngredientsSchema),
    ingredientControllers.addMultipleIngredients
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