import { IngredientDocument } from "../../models/ingredient.model";
import { IngredientType } from "../../../interfaces";
import { mockIngredients } from "../../../lib/mock/mockData";
import { getIngredientsByCategoryDB, searchIngredientsByQueryAndTypeDB } from "../../data-access/ingredient.da";
import { getUserIngredientsDB, addUserIngredientDB, addMultipleUserIngredientsDB, deleteUserIngredientDB, deleteAllUserIngredientsDB } from "../../data-access/userIngredient.da";
import ingredientServices from "../ingredients.service";
import userIngredientServices from "../userIngredients.service";

jest.mock('../../data-access/ingredient.da');
jest.mock('../../data-access/userIngredient.da');

describe('ingredient services', () => {
    const userId = 'testUserId';
    const ingredientId = 'ingredientId';
    const category = ['Vegetables'];
    const type: IngredientType[] = ['food'];

    describe('userIngredientServices.getAll', () => {
        it('should return all user ingredients', async () => {
            const mockIngredients = [{ id: ingredientId, name: 'testIngredient', category, type }];

            (getUserIngredientsDB as jest.Mock).mockResolvedValue(mockIngredients);

            const result = await userIngredientServices.getAll(userId);

            expect(getUserIngredientsDB).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockIngredients);
        });
    });

    describe('userIngredientServices.addIngredient', () => {
        it('should add a new ingredient successfully', async () => {
            const name = 'testIngredient';
            const type: IngredientType[] = ['food'];
            const mockNewIngredient = { id: ingredientId, name, type: type };

            (addUserIngredientDB as jest.Mock).mockResolvedValue(mockNewIngredient);

            const result = await userIngredientServices.addIngredient({
                userId,
                ingredientId,
                name,
                type
            });

            expect(addUserIngredientDB).toHaveBeenCalledWith({ userId, ingredientId, name, type });
            expect(result).toEqual(mockNewIngredient);
        });
    });

    describe('userIngredientServices.addMultiple', () => {
        it('should add multiple ingredients successfully', async () => {
            
            const mockUserIngredientDocs = mockIngredients.map((ingredient) => ({
                userId,
                ingredientId: ingredient.id,
                name: ingredient.name,
                type: ingredient.type,
            }));
    
            const mockNewIngredients = mockIngredients.map((ingredient) => ({
                id: ingredient.id,
                name: ingredient.name,
                type: ingredient.type,
            }));
    
            (addMultipleUserIngredientsDB as jest.Mock).mockResolvedValue(mockNewIngredients);
    
            const result = await userIngredientServices.addMultiple(userId, mockIngredients);
    
            expect(addMultipleUserIngredientsDB).toHaveBeenCalledWith(mockUserIngredientDocs);
            expect(result).toEqual(mockNewIngredients);
        });
    });
    

    describe('userIngredientServices.deleteIngredient', () => {
        it('should delete the specified ingredient successfully', async () => {

            (deleteUserIngredientDB as jest.Mock).mockResolvedValue(undefined);

            const result = await userIngredientServices.deleteIngredient(userId, ingredientId);

            expect(deleteUserIngredientDB).toHaveBeenCalledWith(userId, ingredientId);
            expect(result).toEqual({ message: 'Ingredient deleted successfully' });
        });
    });

    describe('userIngredientServices.deleteAll', () => {
        it('should delete all user ingredients successfully', async () => {

            (deleteAllUserIngredientsDB as jest.Mock).mockResolvedValue(undefined);

            const result = await userIngredientServices.deleteAll(userId);

            expect(deleteAllUserIngredientsDB).toHaveBeenCalledWith(userId);
            expect(result).toEqual({ message: 'All ingredients deleted successfully' });
        });
    });

    describe('ingredientServices.getByCategory', () => {
        it('should return ingredients by category successfully', async () => {
            const searchedCategory = 'Vegetables';
            const mockIngredients: IngredientDocument[] = [{ name: 'Carrot', category } as unknown as IngredientDocument];

            (getIngredientsByCategoryDB as jest.Mock).mockResolvedValue(mockIngredients);

            const result = await ingredientServices.getByCategory(searchedCategory);

            expect(getIngredientsByCategoryDB).toHaveBeenCalledWith(searchedCategory);
            expect(result).toEqual(mockIngredients);
        });
    });

    describe('ingredientServices.search', () => {
        it('should return ingredients matching the query successfully', async () => {
            const query = { name: /Carrot/i };
            const type = 'food';
            const mockIngredients: IngredientDocument[] = [{ name: 'Carrot', category: ['Vegetables'] } as unknown as IngredientDocument];

            (searchIngredientsByQueryAndTypeDB as jest.Mock).mockResolvedValue(mockIngredients);

            const result = await ingredientServices.search(query, type);

            expect(searchIngredientsByQueryAndTypeDB).toHaveBeenCalledWith(query, type);
            expect(result).toEqual(mockIngredients);
        });
    });
});
