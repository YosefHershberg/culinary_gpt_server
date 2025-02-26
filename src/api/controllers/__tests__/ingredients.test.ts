import request from 'supertest';
import { HttpStatusCode } from 'axios';
import ingredientServices from '../../services/ingredients.service';
import userIngredientServices from '../../services/userIngredients.service';
import app, { userId } from '../../../lib/mock/mockApp';
import { mockIngredient, mockIngredients, mockMessageResponse } from '../../../lib/mock/mockData';

// Mock the services
jest.mock('../../services/ingredients.service', () => ({
    getByCategory: jest.fn(),
    search: jest.fn(),
}));
jest.mock('../../services/userIngredients.service', () => ({
        getAll: jest.fn(),
        addIngredient: jest.fn(),
        deleteIngredient: jest.fn(),
        deleteAll: jest.fn(),
        addMultiple: jest.fn(),
}));

describe('Ingredients API', () => {

    describe('GET /api/user/ingredients', () => {
        it('should return all ingredients for a user', async () => {
            (userIngredientServices.getAll as jest.Mock).mockResolvedValue(mockIngredients);

            const res = await request(app)
                .get('/api/user/ingredients')

            expect(res.status).toBe(HttpStatusCode.Ok);
            expect(res.body).toEqual(mockIngredients);
            expect(userIngredientServices.getAll).toHaveBeenCalledWith(userId);
        });
    });

    describe('POST /api/user/ingredients/multiple', () => {
        it('should add multiple ingredients', async () => {

            // Mock the addMultiple function
            (userIngredientServices.addMultiple as jest.Mock).mockResolvedValue(mockIngredients);

            const res = await request(app)
                .post('/api/user/ingredients/multiple')
                .send(mockIngredients)

            expect(res.status).toBe(HttpStatusCode.Ok);
            expect(res.body).toEqual(mockIngredients);
            expect(userIngredientServices.addMultiple).toHaveBeenCalledWith(
                userId,
                mockIngredients
            );
        });
    });



    describe('DELETE /api/user/ingredients/:id', () => {
        it('should delete an ingredient', async () => {
            (userIngredientServices.deleteIngredient as jest.Mock).mockResolvedValue(mockMessageResponse);

            const res = await request(app)
                .delete(`/api/user/ingredients/${mockIngredient.id}`)

            expect(res.status).toBe(HttpStatusCode.Ok);
            expect(res.body).toEqual(mockMessageResponse);
            expect(userIngredientServices.deleteIngredient).toHaveBeenCalledWith(userId, mockIngredient.id);
        });
    });

    describe('DELETE /api/user/ingredients/all', () => {
        it('should delete an ingredient', async () => {
            (userIngredientServices.deleteAll as jest.Mock).mockResolvedValue(mockMessageResponse);

            const res = await request(app)
                .delete('/api/user/ingredients/all')

            expect(res.status).toBe(HttpStatusCode.Ok);
            expect(userIngredientServices.deleteAll).toHaveBeenCalledWith(userId);
        });
    });

    describe('GET /api/ingredients/suggestions/:category', () => {
        it('should return ingredient suggestions by category', async () => {
            const category = 'carbs';
            (ingredientServices.getByCategory as jest.Mock).mockResolvedValue(mockIngredients);

            const res = await request(app)
                .get(`/api/ingredients/suggestions/${category}`);

            expect(res.status).toBe(HttpStatusCode.Ok);
            expect(res.body).toEqual(mockIngredients);
            expect(ingredientServices.getByCategory).toHaveBeenCalledWith(category);
        });
    });

    describe('GET /ingredients/search', () => {
        it('should search ingredients', async () => {
            const query = 'Tomato';
            const type = 'food';
            (ingredientServices.search as jest.Mock).mockResolvedValue(mockIngredients);

            const res = await request(app)
                .get('/api/ingredients/search')
                .query({ query, type });

            expect(res.status).toBe(HttpStatusCode.Ok);
            expect(res.body).toEqual(mockIngredients);
            expect(ingredientServices.search).toHaveBeenCalledWith(query, type);
        });
    });
});
