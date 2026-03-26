import express from 'express';
import * as ingredientControllers from '../controllers/ingredients.controller';
import { validate } from '../../middlewares';
import type { IngredientModel } from '../../generated/prisma/models';
import type { MessageResponse } from '../../types';

const router = express.Router();

router.get<{}, IngredientModel[] | MessageResponse>(
    '/suggestions/:category',
    validate(ingredientControllers.ingredientSuggestionsSchema),
    ingredientControllers.ingredientSuggestions
);


router.get<{}, IngredientModel[] | MessageResponse>(
    '/search',
    validate(ingredientControllers.searchIngredientsSchema),
    ingredientControllers.searchIngredients
);

router.post<{}, IngredientModel[] | MessageResponse>(
    '/image-detect',
    validate(ingredientControllers.imageIngredientDetectorSchema),
    ingredientControllers.imageIngredientDetector
)

export default router;