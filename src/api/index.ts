import express from 'express';

import { validate } from '../middlewares';

import ingredientRoutes from './routes/ingredients.routes';
import kitchenUtilsRoutes from './routes/kithchenUtils.routes';
import recipesRoutes from './routes/recipes.routes';

import { ingredientSuggestions, ingredientSuggestionsSchema } from './controllers/ingredients.controller';
import createRecipe, { createRecipeSchema } from './controllers/createRecipe.controller';
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
