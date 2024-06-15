import express, { Response } from 'express';
import { ingredientSuggestionsController } from './controllers/ingredientSuggestionsController';
import userDataRoutes from './routes/userDataRoutes';
import createRecipeController from './controllers/createRecipeController';
import searchIngredientsController from './controllers/searchIngredientsController';

const router = express.Router();

router.use('/user', userDataRoutes)

router.get('/ingredient-suggestions/:category', ingredientSuggestionsController);

router.get('/ingredient-suggestions', ingredientSuggestionsController);

router.get('/search', searchIngredientsController);

router.post('/create-recipe', createRecipeController);

export default router;
