import express from 'express';
import MessageResponse from '../../interfaces/MessageResponse';
import { imageIngredientDetector, imageIngredientDetectorSchema, ingredientSuggestions, ingredientSuggestionsSchema, searchIngredients, searchIngredientsSchema } from '../controllers/ingredients.controller';
import { validate } from '../../middlewares';
import { IngredientDocument } from '../models/ingredient.model';

const router = express.Router();

router.get<{}, IngredientDocument[] | MessageResponse>(
    '/suggestions/:category',
    validate(ingredientSuggestionsSchema),
    ingredientSuggestions
);


router.get<{}, IngredientDocument[] | MessageResponse>(
    '/search',
    validate(searchIngredientsSchema),
    searchIngredients
);

router.post<{}, IngredientDocument[] | MessageResponse>(
    '/image-detect',
    validate(imageIngredientDetectorSchema),
    imageIngredientDetector
)

export default router;