import express from 'express';
import * as ingredientControllers from '../controllers/ingredients.controller';
import { validate } from '../../middlewares';
import { type Ingredient, type MessageResponse } from '../../types';

const router = express.Router();

router.get<{}, Ingredient[] | MessageResponse>(
    '/suggestions/:category',
    validate(ingredientControllers.ingredientSuggestionsSchema),
    ingredientControllers.ingredientSuggestions
);


router.get<{}, Ingredient[] | MessageResponse>(
    '/search',
    validate(ingredientControllers.searchIngredientsSchema),
    ingredientControllers.searchIngredients
);

router.post<{}, Ingredient[] | MessageResponse>(
    '/image-detect',
    validate(ingredientControllers.imageIngredientDetectorSchema),
    ingredientControllers.imageIngredientDetector
)

export default router;