import express from 'express';
import * as userDataController from '../controllers/userDataController';
import Ingredient from '../../interfaces/Ingredient';
import MessageResponse from '../../interfaces/MessageResponse';

const router = express.Router();

router.get<{}, Ingredient[]>('/ingredients', userDataController.getIngredients);

router.post<{}, Ingredient>('/ingredients', userDataController.addIngredient);

router.delete<{ id: string }, MessageResponse>('/ingredients/:id', userDataController.deleteIngredient);

router.get<{}, string[]>('/kitchen-utils', userDataController.getKitchenUtils);

router.post<{}, string>('/kitchen-utils', userDataController.updateKitchenUtils);

export default router;