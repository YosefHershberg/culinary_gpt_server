import express from 'express';

import { validate } from '../middlewares';

import ingredientRoutes from './routes/ingredients.routes';
import kitchenUtilsRoutes from './routes/kitchenUtils.routes';
import recipesRoutes from './routes/recipes.routes';

import { ingredientSuggestions, ingredientSuggestionsSchema } from './controllers/ingredients.controller';
import searchIngredients, { searchIngredientsSchema } from './controllers/searchIngredients.controller';

const router = express.Router();

router.use(
    '/user/ingredients',
    ingredientRoutes
)

router.use(
    '/user/kitchen-utils',
    kitchenUtilsRoutes
)

router.use(
    '/user/recipes',
    recipesRoutes
)

router.get(
    '/ingredient-suggestions/:category',
    validate(ingredientSuggestionsSchema),
    ingredientSuggestions
);


router.get(
    '/ingredients/search',
    validate(searchIngredientsSchema),
    searchIngredients
);

export default router;
