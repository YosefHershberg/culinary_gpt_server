import express from 'express';
import * as userDataController from '../controllers/userDataControllers';
import { Ingredient } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';
import { validate } from '../../middlewares';


const router = express.Router();

router.get<{}, Ingredient[]>(
    '/ingredients',
    userDataController.getIngredients
);

router.post<{}, Ingredient>(
    '/ingredients',
    validate(userDataController.addIngredientSchema),
    userDataController.addIngredient
);

router.delete<{ id: string }, MessageResponse>(
    '/ingredients/:id',
    validate(userDataController.doSomethingByIdSchema),
    userDataController.deleteIngredient
);

router.get(
    '/kitchen-utils',
    userDataController.getKitchenUtils
);

router.post(
    '/kitchen-utils',
    validate(userDataController.updateKitchenUtilsSchema),
    userDataController.updateKitchenUtils
);

router.get<{}, any[]>(
    '/recipes',
    userDataController.getRecipes
);

router.post<{}, any>(
    '/recipes',
    validate(userDataController.addRecipeSchema),
    userDataController.addRecipe
);

router.get<{ id: string }, any>(
    '/recipes/:id',
    validate(userDataController.doSomethingByIdSchema),
    userDataController.getRecipe
);

router.delete<{ id: string }, MessageResponse>(
    '/recipes/:id',
    validate(userDataController.doSomethingByIdSchema),
    userDataController.deleteRecipe
);

export default router;

//TODO: fix the types for the routes