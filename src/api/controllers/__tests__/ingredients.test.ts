import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { ingredientOperations, userIngredientOperations } from '../../services/ingredients.service';
import app, { userId } from '../../../lib/mock/mockApp';

// Mock data
const mockIngredient = { id: '1', name: 'Bread', category: ['carbs'], type: ['food'] };
const mockIngredients = [mockIngredient];
const mockMessageResponse = { message: 'Ingredient deleted successfully' };

// Mock the services
jest.mock('../../services/ingredients.service', () => ({
    userIngredientOperations: {
        getAll: jest.fn(),
        addIngredient: jest.fn(),
        deleteIngredient: jest.fn(),
        deleteAll: jest.fn(),
    },
    ingredientOperations: {
        getByCategory: jest.fn(),
        search: jest.fn(),
    },
}));

describe('Ingredients API', () => {

    describe('GET /api/user/ingredients', () => {
        it('should return all ingredients for a user', async () => {
            (userIngredientOperations.getAll as jest.Mock).mockResolvedValue(mockIngredients);

            const res = await request(app)
                .get('/api/user/ingredients')

            expect(res.status).toBe(StatusCodes.OK);
            expect(res.body).toEqual(mockIngredients);
            expect(userIngredientOperations.getAll).toHaveBeenCalledWith(userId);
        });
    });

    describe('POST /api/user/ingredients', () => {
        it('should add a new ingredient', async () => {
            (userIngredientOperations.addIngredient as jest.Mock).mockResolvedValue(mockIngredient);

            const res = await request(app)
                .post('/api/user/ingredients')
                .send(mockIngredient);

            expect(res.status).toBe(StatusCodes.OK);
            expect(res.body).toEqual(mockIngredient);
            expect(userIngredientOperations.addIngredient).toHaveBeenCalledWith({
                userId,
                ingredientId: mockIngredient.id,
                type: mockIngredient.type,
                name: mockIngredient.name,
            });
        });
    });

    describe('DELETE /api/user/ingredients/:id', () => {
        it('should delete an ingredient', async () => {
            (userIngredientOperations.deleteIngredient as jest.Mock).mockResolvedValue(mockMessageResponse);

            const res = await request(app)
                .delete(`/api/user/ingredients/${mockIngredient.id}`)

            expect(res.status).toBe(StatusCodes.OK);
            expect(res.body).toEqual(mockMessageResponse);
            expect(userIngredientOperations.deleteIngredient).toHaveBeenCalledWith(userId, mockIngredient.id);
        });
    });

    describe('DELETE /api/user/ingredients/all', () => {
        it('should delete an ingredient', async () => {
            (userIngredientOperations.deleteAll as jest.Mock).mockResolvedValue(mockMessageResponse);

            const res = await request(app)
                .delete('/api/user/ingredients/all')

            expect(res.status).toBe(StatusCodes.OK);
            expect(userIngredientOperations.deleteAll).toHaveBeenCalledWith(userId);
        });
    });

    describe('GET /api/ingredients/suggestions/:category', () => {
        it('should return ingredient suggestions by category', async () => {
            const category = 'carbs';
            (ingredientOperations.getByCategory as jest.Mock).mockResolvedValue(mockIngredients);

            const res = await request(app)
                .get(`/api/ingredients/suggestions/${category}`);

            expect(res.status).toBe(StatusCodes.OK);
            expect(res.body).toEqual(mockIngredients);
            expect(ingredientOperations.getByCategory).toHaveBeenCalledWith(category);
        });
    });

    describe('GET /ingredients/search', () => {
        it('should search ingredients', async () => {
            const query = 'Tomato';
            const type = 'food';
            (ingredientOperations.search as jest.Mock).mockResolvedValue(mockIngredients);

            const res = await request(app)
                .get('/api/ingredients/search')
                .query({ query, type });

            expect(res.status).toBe(StatusCodes.OK);
            expect(res.body).toEqual(mockIngredients);
            expect(ingredientOperations.search).toHaveBeenCalledWith(query, type);
        });
    });
});
