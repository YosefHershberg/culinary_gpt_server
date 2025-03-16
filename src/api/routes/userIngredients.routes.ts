import express from 'express';

import { validate } from '../../middlewares';

import * as userIngredientControllers from '../controllers/userIngredients.controller';
import type { UserIngredientResponse, MessageResponse } from '../../types';
import { doSomethingByIdSchema } from '../schemas';

const router = express.Router();

router.get<{}, UserIngredientResponse[] | MessageResponse>(
    '/',
    userIngredientControllers.getAllIngredients
);

router.post<{}, UserIngredientResponse | MessageResponse>(
    '/',
    validate(userIngredientControllers.addIngredientSchema),
    userIngredientControllers.addIngredient
);

router.post<{}, UserIngredientResponse[] | MessageResponse>(
    '/multiple',
    validate(userIngredientControllers.addMultipleIngredientsSchema),
    userIngredientControllers.addMultipleIngredients
);

router.delete<{ id: string }, MessageResponse>(
    '/all',
    userIngredientControllers.deleteAllIngredients
);

router.delete<{ id: string }, MessageResponse>(
    '/:id',
    validate(doSomethingByIdSchema),
    userIngredientControllers.deleteIngredient
);

export default router;