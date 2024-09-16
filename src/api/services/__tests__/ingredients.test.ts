import { getUserIngredients, addUserIngredient, deleteUserIngredient, deleteAllUserIngredients } from "../../data-access/ingredient.da";
import * as ingredientOperationsDB from "../../data-access/ingredient.da";
import { userIngredientOperations, ingredientOperations } from "../ingredients.service";
import { IngredientDocument } from "../../models/ingredient.model";
import { UserIngredient } from "../../../interfaces";

jest.mock('../../data-access/ingredient.da');

describe('ingredient services', () => {
    const userId = 'testUserId';
    const ingredientId = 'ingredientId';
    const category = ['Vegetables'];

    describe('userIngredientOperations.getAll', () => {
        it('should return all user ingredients', async () => {
            const mockIngredients: UserIngredient[] = [{ id: ingredientId, name: 'testIngredient', category }];

            (getUserIngredients as jest.Mock).mockResolvedValue(mockIngredients);

            const result = await userIngredientOperations.getAll(userId);

            expect(getUserIngredients).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockIngredients);
        });
    });

    describe('userIngredientOperations.addIngredient', () => {
        it('should add a new ingredient successfully', async () => {
            const name = 'testIngredient';
            const mockNewIngredient: UserIngredient = { id: ingredientId, name };

            (addUserIngredient as jest.Mock).mockResolvedValue(mockNewIngredient);

            const result = await userIngredientOperations.addIngredient(userId, ingredientId, name);

            expect(addUserIngredient).toHaveBeenCalledWith(userId, ingredientId, name);
            expect(result).toEqual(mockNewIngredient);
        });
    });

    describe('userIngredientOperations.deleteIngredient', () => {
        it('should delete the specified ingredient successfully', async () => {

            (deleteUserIngredient as jest.Mock).mockResolvedValue(undefined);

            const result = await userIngredientOperations.deleteIngredient(userId, ingredientId);

            expect(deleteUserIngredient).toHaveBeenCalledWith(userId, ingredientId);
            expect(result).toEqual({ message: 'Ingredient deleted successfully' });
        });
    });

    describe('userIngredientOperations.deleteAll', () => {
        it('should delete all user ingredients successfully', async () => {

            (deleteAllUserIngredients as jest.Mock).mockResolvedValue(undefined);

            const result = await userIngredientOperations.deleteAll(userId);

            expect(deleteAllUserIngredients).toHaveBeenCalledWith(userId);
            expect(result).toEqual({ message: 'All ingredients deleted successfully' });
        });
    });

    describe('ingredientOperations.getByCategory', () => {
        it('should return ingredients by category successfully', async () => {
            const searchedCategory = 'Vegetables';
            const mockIngredients: IngredientDocument[] = [{ name: 'Carrot', category } as unknown as IngredientDocument];

            (ingredientOperationsDB.getByCategory as jest.Mock).mockResolvedValue(mockIngredients);

            const result = await ingredientOperations.getByCategory(searchedCategory);

            expect(ingredientOperationsDB.getByCategory).toHaveBeenCalledWith(searchedCategory);
            expect(result).toEqual(mockIngredients);
        });
    });

    describe('ingredientOperations.search', () => {
        it('should return ingredients matching the query successfully', async () => {
            const query = { name: /Carrot/i };
            const type = 'food';
            const mockIngredients: IngredientDocument[] = [{ name: 'Carrot', category: ['Vegetables'] } as unknown as IngredientDocument];

            (ingredientOperationsDB.searchByQueryAndIngredientType as jest.Mock).mockResolvedValue(mockIngredients);

            const result = await ingredientOperations.search(query, type);

            expect(ingredientOperationsDB.searchByQueryAndIngredientType).toHaveBeenCalledWith(query, type);
            expect(result).toEqual(mockIngredients);
        });
    });
});
