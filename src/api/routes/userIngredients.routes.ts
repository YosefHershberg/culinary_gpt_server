import express from 'express';

import { validate } from '../../middlewares';

import * as userIngredientControllers from '../controllers/userIngredients.controller';
import { PartialIngredient as PartialIngredient } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';
import { doSomethingByIdSchema } from '../schemas';

const router = express.Router();

router.get<{}, PartialIngredient[] | MessageResponse>(
    '/',
    userIngredientControllers.getIngredients
);

router.post<{}, PartialIngredient | MessageResponse>(
    '/',
    validate(userIngredientControllers.addIngredientSchema),
    userIngredientControllers.addIngredient
);

router.post<{}, PartialIngredient[] | MessageResponse>(
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