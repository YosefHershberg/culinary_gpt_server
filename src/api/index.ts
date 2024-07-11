import express from 'express';

import userDataRoutes from './routes/userDataRoutes';
import ingredientSuggestionsController, { ingredientSuggestionsSchema } from './controllers/ingredientSuggestionsController';
import createRecipeController, { createRecipeSchema } from './controllers/createRecipeController';
import searchIngredientsController, { searchIngredientsSchema } from './controllers/searchIngredientsController';

import { validate } from '../middlewares';

const router = express.Router();

router.use(
    '/user',
    userDataRoutes
)

router.get(
    '/ingredient-suggestions/:category',
    validate(ingredientSuggestionsSchema),
    ingredientSuggestionsController
);

router.get(
    '/search',
    validate(searchIngredientsSchema),
    searchIngredientsController
);

router.post(
    '/create-recipe',
    validate(createRecipeSchema),
    createRecipeController
);

export default router;
