import express from 'express';
import { MessageResponse } from '../../types/http.types';
import { imageIngredientDetector, imageIngredientDetectorSchema, ingredientSuggestions, ingredientSuggestionsSchema, searchIngredients, searchIngredientsSchema } from '../controllers/ingredients.controller';
import { validate } from '../../middlewares';
import { Ingredient } from '../../types';

const router = express.Router();

router.get<{}, Ingredient[] | MessageResponse>(
    '/suggestions/:category',
    validate(ingredientSuggestionsSchema),
    ingredientSuggestions
);


router.get<{}, Ingredient[] | MessageResponse>(
    '/search',
    validate(searchIngredientsSchema),
    searchIngredients
);

router.post<{}, Ingredient[] | MessageResponse>(
    '/image-detect',
    validate(imageIngredientDetectorSchema),
    imageIngredientDetector
)

export default router;