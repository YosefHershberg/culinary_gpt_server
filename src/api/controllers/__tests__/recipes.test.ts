import request from 'supertest';
import app, { userId } from '../../../lib/mock/mockApp';
import recipeOperations from '../../services/recipes.service';
import createRecipeOperations from '../../services/createRecipe.service';
import { HttpStatusCode } from 'axios';
import { mockRecipe } from '../../../lib/mock/mockData';
import { FilterOptions } from '../../../interfaces/ServiceInterfaces';

jest.mock('../../services/recipes.service');
jest.mock('../../services/createRecipe.service');

describe('Recipe Controller', () => {
    const mockRecipes = [{ id: '1', name: 'Test Recipe' }];

    describe('GET /api/user/recipes', () => {
        it('should return a list of recipes for the user', async () => {
            (recipeOperations.getUserPageRecipes as jest.Mock).mockResolvedValue(mockRecipes);

            const response = await request(app)
                .get('/api/user/recipes')
                .query({ page: 1, limit: 10 });

            const props = {
                userId,
                page: 1,
                limit: 10,
                query: undefined,
                filter: 'all' as FilterOptions
            };

            const recipes = await recipeOperations.getUserPageRecipes(props);

            expect(response.status).toBe(HttpStatusCode.Ok);
            expect(response.body).toEqual(mockRecipes);
            expect(recipeOperations.getUserPageRecipes).toHaveBeenCalledWith(props);
        });
    });

    describe('POST /api/user/recipes', () => {

        it('should add a new recipe', async () => {
            (recipeOperations.addRecipe as jest.Mock).mockResolvedValue(mockRecipe);

            const response = await request(app)
                .post('/api/user/recipes')
                .send(mockRecipe)

            expect(response.status).toBe(HttpStatusCode.Ok);
            expect(response.body).toEqual(mockRecipe);
            expect(recipeOperations.addRecipe).toHaveBeenCalledWith({ ...mockRecipe, userId });
        });
    });

    describe('GET /api/user/recipes/:id', () => {
        const recipeId = '1';

        it('should return a recipe by id', async () => {
            (recipeOperations.getRecipeById as jest.Mock).mockResolvedValue(mockRecipes[0]);

            const response = await request(app)
                .get(`/api/user/recipes/${recipeId}`)

            expect(response.status).toBe(HttpStatusCode.Ok);
            expect(response.body).toEqual(mockRecipes[0]);
            expect(recipeOperations.getRecipeById).toHaveBeenCalledWith(recipeId);
        });
    });

    describe('DELETE /api/user/recipes/:id', () => {
        const recipeId = '1';

        it('should delete a recipe by id', async () => {
            const deleteMessage = { message: 'Recipe deleted successfully' };
            (recipeOperations.deleteRecipe as jest.Mock).mockResolvedValue(deleteMessage);

            const response = await request(app)
                .delete(`/api/user/recipes/${recipeId}`)

            expect(response.status).toBe(HttpStatusCode.Ok);
            expect(response.body).toEqual(deleteMessage);
            expect(recipeOperations.deleteRecipe).toHaveBeenCalledWith(recipeId);
        });
    });

    describe('POST /api/user/recipes/create', () => {
        const mockRecipeInput = {
            mealSelected: 'breakfast',
            selectedTime: 10,
            prompt: 'make it spicy & kosher',
            numOfPeople: 2,
        };

        const createdRecipe = { id: '3', ...mockRecipeInput, userId };

        it('should create a recipe', async () => {
            // Mock `res` to simulate the `Response` object
            const resMock = {
                setHeader: jest.fn(),
                flushHeaders: jest.fn(),
                on: jest.fn(),
                end: jest.fn(),
            };

            (createRecipeOperations.createRecipe as jest.Mock).mockResolvedValueOnce(createdRecipe);

            const response = await request(app)
                .post('/api/user/recipes/create')
                .send(mockRecipeInput);

            expect(response.status).toBe(HttpStatusCode.Ok);
            expect(createRecipeOperations.createRecipe).toHaveBeenCalledWith(userId, mockRecipeInput, expect.any(Object));
        });
    });

});
