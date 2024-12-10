import express from 'express';
import { PartialUserIngredientResponse as PartialIngredient } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';
import { imageIngredientDetector, imageIngredientDetectorSchema, ingredientSuggestions, ingredientSuggestionsSchema, searchIngredients, searchIngredientsSchema } from '../controllers/ingredients.controller';
import { validate } from '../../middlewares';

const router = express.Router();

router.get<{}, PartialIngredient[] | MessageResponse>(
    '/suggestions/:category',
    validate(ingredientSuggestionsSchema),
    ingredientSuggestions
);


router.get<{}, PartialIngredient[] | MessageResponse>(
    '/search',
    validate(searchIngredientsSchema),
    searchIngredients
);

router.post<{}, PartialIngredient[] | MessageResponse>(
    '/image-ingredient-detector',
    validate(imageIngredientDetectorSchema),
    imageIngredientDetector
)

export default router;