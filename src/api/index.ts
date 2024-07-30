import express from 'express';

import { validate } from '../middlewares';

import ingredientRoutes from './routes/ingredients.routes';
import kitchenUtilsRoutes from './routes/kithchenUtils.routes';
import recipesRoutes from './routes/recipes.routes';

import { ingredientSuggestions, ingredientSuggestionsSchema } from './controllers/ingredients.controller';
import searchIngredients, { searchIngredientsSchema } from './controllers/searchIngredients.controller';
import CustomRequest from '../interfaces/CustomRequest';
import { userIngredientOperations } from './services/ingredients.service';

const router = express.Router();

router.delete('/del', async (req: CustomRequest, res) => {
    try {
        await userIngredientOperations.deleteAll(req.userId as string);
        return res.json({ message: 'All ingredients deleted' });
    } catch (error) {
        console.log(error instanceof Error && error.message);
    }
})

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

export default router;
