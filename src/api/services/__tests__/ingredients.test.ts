import { getUserIngredientsDB, addUserIngredientDB, deleteUserIngredientDB, deleteAllUserIngredientsDB, getIngredientsByCategoryDB, searchIngredientsByQueryAndTypeDB } from "../../data-access/ingredient.da";
import { userIngredientOperations, ingredientOperations } from "../ingredients.service";
import { IngredientDocument } from "../../models/ingredient.model";
import { IngredientType } from "../../../interfaces";

jest.mock('../../data-access/ingredient.da');

describe('ingredient services', () => {
    const userId = 'testUserId';
    const ingredientId = 'ingredientId';
    const category = ['Vegetables'];
    const type: IngredientType[] = ['food'];

    describe('userIngredientOperations.getAll', () => {
        it('should return all user ingredients', async () => {
            const mockIngredients = [{ id: ingredientId, name: 'testIngredient', category, type }];

            (getUserIngredientsDB as jest.Mock).mockResolvedValue(mockIngredients);

            const result = await userIngredientOperations.getAll(userId);

            expect(getUserIngredientsDB).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockIngredients);
        });
    });

    describe('userIngredientOperations.addIngredient', () => {
        it('should add a new ingredient successfully', async () => {
            const name = 'testIngredient';
            const type: IngredientType[] = ['food'];
            const mockNewIngredient = { id: ingredientId, name, type: type };

            (addUserIngredientDB as jest.Mock).mockResolvedValue(mockNewIngredient);

            const result = await userIngredientOperations.addIngredient({
                userId,
                ingredientId,
                name,
                type
            });

            expect(addUserIngredientDB).toHaveBeenCalledWith({ userId, ingredientId, name, type });
            expect(result).toEqual(mockNewIngredient);
        });
    });

    describe('userIngredientOperations.deleteIngredient', () => {
        it('should delete the specified ingredient successfully', async () => {

            (deleteUserIngredientDB as jest.Mock).mockResolvedValue(undefined);

            const result = await userIngredientOperations.deleteIngredient(userId, ingredientId);

            expect(deleteUserIngredientDB).toHaveBeenCalledWith(userId, ingredientId);
            expect(result).toEqual({ message: 'Ingredient deleted successfully' });
        });
    });

    describe('userIngredientOperations.deleteAll', () => {
        it('should delete all user ingredients successfully', async () => {

            (deleteAllUserIngredientsDB as jest.Mock).mockResolvedValue(undefined);

            const result = await userIngredientOperations.deleteAll(userId);

            expect(deleteAllUserIngredientsDB).toHaveBeenCalledWith(userId);
            expect(result).toEqual({ message: 'All ingredients deleted successfully' });
        });
    });

    describe('ingredientOperations.getByCategory', () => {
        it('should return ingredients by category successfully', async () => {
            const searchedCategory = 'Vegetables';
            const mockIngredients: IngredientDocument[] = [{ name: 'Carrot', category } as unknown as IngredientDocument];

            (getIngredientsByCategoryDB as jest.Mock).mockResolvedValue(mockIngredients);

            const result = await ingredientOperations.getByCategory(searchedCategory);

            expect(getIngredientsByCategoryDB).toHaveBeenCalledWith(searchedCategory);
            expect(result).toEqual(mockIngredients);
        });
    });

    describe('ingredientOperations.search', () => {
        it('should return ingredients matching the query successfully', async () => {
            const query = { name: /Carrot/i };
            const type = 'food';
            const mockIngredients: IngredientDocument[] = [{ name: 'Carrot', category: ['Vegetables'] } as unknown as IngredientDocument];

            (searchIngredientsByQueryAndTypeDB as jest.Mock).mockResolvedValue(mockIngredients);

            const result = await ingredientOperations.search(query, type);

            expect(searchIngredientsByQueryAndTypeDB).toHaveBeenCalledWith(query, type);
            expect(result).toEqual(mockIngredients);
        });
    });
});
