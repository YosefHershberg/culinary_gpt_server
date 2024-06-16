import express from 'express';
import * as userDataController from '../controllers/userDataControllers';
import Ingredient from '../../interfaces/Ingredient';
import MessageResponse from '../../interfaces/MessageResponse';

const router = express.Router();

router.get<{}, Ingredient[]>('/ingredients', userDataController.getIngredients);

router.post<{}, Ingredient>('/ingredients', userDataController.addIngredient);

router.delete<{ id: string }, MessageResponse>('/ingredients/:id', userDataController.deleteIngredient);

router.get('/kitchen-utils', userDataController.getKitchenUtils);

router.post('/kitchen-utils', userDataController.updateKitchenUtils);

router.get<{}, any[]>('/recipes', userDataController.getRecipes);

router.post<{}, any>('/recipes', userDataController.addRecipe);

router.get<{ id: string }, any>('/recipes/:id', userDataController.getRecipe);

router.delete<{ id: string }, MessageResponse>('/recipes/:id', userDataController.deleteRecipe);

export default router;

//TODO: fix the types for the routes