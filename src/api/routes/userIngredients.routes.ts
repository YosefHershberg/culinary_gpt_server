import express from 'express';

import { validate } from '../../middlewares';

import * as userIngredientControllers from '../controllers/userIngredients.controller';
import { UserIngredient as UserIngredient, MessageResponse } from '../../types';
import { doSomethingByIdSchema } from '../schemas';

const router = express.Router();

router.get<{}, UserIngredient[] | MessageResponse>(
    '/',
    userIngredientControllers.getAllIngredients
);

router.post<{}, UserIngredient | MessageResponse>(
    '/',
    validate(userIngredientControllers.addIngredientSchema),
    userIngredientControllers.addIngredient
);

router.post<{}, UserIngredient[] | MessageResponse>(
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