import express from 'express';

import userDataRoutes from './routes/userDataRoutes';
import ingredientSuggestions, { ingredientSuggestionsSchema } from './controllers/ingredientSuggestions.controller';
import createRecipe, { createRecipeSchema } from './controllers/createRecipe.controller';
import searchIngredients, { searchIngredientsSchema } from './controllers/searchIngredients.controller';

import { validate } from '../middlewares';

const router = express.Router();

router.use(
    '/user',
    userDataRoutes
)

router.get(
    '/ingredient-suggestions/:category',
    validate(ingredientSuggestionsSchema),
    ingredientSuggestions
);

router.get(
    '/search',
    validate(searchIngredientsSchema),
    searchIngredients
);

router.post(
    '/create-recipe',
    validate(createRecipeSchema),
    createRecipe
);

export default router;
