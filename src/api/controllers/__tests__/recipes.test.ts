import request from 'supertest';
import app, { userId } from '../../../lib/mock/mockApp';
import { recipeOperations } from '../../services/recipes.service';
import { createRecipeOperations } from '../../services/createRecipe.service';
import { StatusCodes } from 'http-status-codes';
import { mockRecipe } from '../../../lib/mock/mockData';

jest.mock('../../services/recipes.service');
jest.mock('../../services/createRecipe.service');

describe('Recipe Controller', () => {
    const mockRecipes = [{ id: '1', name: 'Test Recipe' }];

    describe('GET /api/user/recipes', () => {
        it('should return a list of recipes for the user', async () => {
            (recipeOperations.getUserRecipes as jest.Mock).mockResolvedValue(mockRecipes);

            const response = await request(app)
                .get('/api/user/recipes')

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toEqual(mockRecipes);
            expect(recipeOperations.getUserRecipes).toHaveBeenCalledWith(userId);
        });
    });

    describe('POST /api/user/recipes', () => {

        it('should add a new recipe', async () => {
            (recipeOperations.addRecipe as jest.Mock).mockResolvedValue(mockRecipe);

            const response = await request(app)
                .post('/api/user/recipes')
                .send(mockRecipe)

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toEqual(mockRecipe);
            expect(recipeOperations.addRecipe).toHaveBeenCalledWith({ ...mockRecipe, userId });
        });
    });

    describe('GET /api/user/recipes/:id', () => {
        const recipeId = '1';

        it('should return a recipe by id', async () => {
            (recipeOperations.getRecipe as jest.Mock).mockResolvedValue(mockRecipes[0]);

            const response = await request(app)
                .get(`/api/user/recipes/${recipeId}`)

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toEqual(mockRecipes[0]);
            expect(recipeOperations.getRecipe).toHaveBeenCalledWith(recipeId);
        });
    });

    describe('DELETE /api/user/recipes/:id', () => {
        const recipeId = '1';

        it('should delete a recipe by id', async () => {
            const deleteMessage = { message: 'Recipe deleted successfully' };
            (recipeOperations.deleteRecipe as jest.Mock).mockResolvedValue(deleteMessage);

            const response = await request(app)
                .delete(`/api/user/recipes/${recipeId}`)

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toEqual(deleteMessage);
            expect(recipeOperations.deleteRecipe).toHaveBeenCalledWith(userId, recipeId);
        });
    });

    describe('POST /api/user/recipes/create', () => {
        const mockRecipeInput = {
            mealSelected: 'breakfast',
            selectedTime: 10,
            prompt: 'make it spicy & kosher',
            numOfPeople: 2,
        }

        const createdRecipe = { id: '3', ...mockRecipeInput, userId };

        it('should create a recipe', async () => {
            (createRecipeOperations.createRecipe as jest.Mock).mockResolvedValue(createdRecipe);

            const response = await request(app)
                .post('/api/user/recipes/create')
                .send(mockRecipeInput)

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toEqual(createdRecipe);
            expect(createRecipeOperations.createRecipe).toHaveBeenCalledWith(userId, mockRecipeInput);
        });
    });
});
