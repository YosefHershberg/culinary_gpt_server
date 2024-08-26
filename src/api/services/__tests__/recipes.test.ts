import { recipeOperations } from '../../services/recipes.service';
import * as recipeOperationsDB from '../../data-access/recipe.da';
import { firebaseStorageOperations } from '../firebase.service';
import { RecipeDocument } from '../../models/recipe.model';
import { mockRecipe } from '../../../lib/mock/mockData';
import { base64ToArrayBuffer, hashString } from '../../../utils/helperFunctions';
import { mock } from 'node:test';
import MessageResponse from '../../../interfaces/MessageResponse';

jest.mock('../../data-access/recipe.da');
jest.mock('../firebase.service');
jest.mock('../../../utils/helperFunctions');

describe('recipeOperations', () => {

    describe('getUserRecipes', () => {
        it('should return the correct recipes for a given user ID', async () => {
            const mockRecipes: RecipeDocument[] = [
                { ...mockRecipe, userId: 'recipeId', createdAt: new Date() } as RecipeDocument
            ];
            (recipeOperationsDB.getRecipes as jest.Mock).mockResolvedValue(mockRecipes);

            const result = await recipeOperations.getUserRecipes('userId');

            expect(result).toEqual(mockRecipes);
        });
    });

    describe('addRecipe', () => {
        it('should add a new recipe and return the added recipe', async () => {
            
            const mockImageBuffer = new ArrayBuffer(8);
            const mockImageUrl = 'mockImageUrl';

            (base64ToArrayBuffer as jest.Mock).mockReturnValue(mockImageBuffer);
            (hashString as jest.Mock).mockReturnValue('hashedDescription');
            (firebaseStorageOperations.uploadImage as jest.Mock).mockResolvedValue(mockImageUrl);
            (recipeOperationsDB.addRecipe as jest.Mock).mockResolvedValue(mockRecipe);

            const result = await recipeOperations.addRecipe(mockRecipe);

            expect(result).toEqual(mockRecipe);
            expect(base64ToArrayBuffer).toHaveBeenCalledWith(mockRecipe.image_url.replace(/^data:image\/(png|jpeg);base64,/, ''));
            expect(hashString).toHaveBeenCalledWith(mockRecipe.recipe.description);
            expect(firebaseStorageOperations.uploadImage).toHaveBeenCalledWith(mockImageBuffer, 'hashedDescription');
            expect(recipeOperationsDB.addRecipe).toHaveBeenCalledWith({ ...mockRecipe, image_url: mockImageUrl });
        });
    });

    describe('deleteRecipe', () => {
        it('should delete the recipe and its associated image from storage', async () => {

            (recipeOperationsDB.getRecipe as jest.Mock).mockResolvedValue(mockRecipe);
            (firebaseStorageOperations.deleteImage as jest.Mock).mockResolvedValue(undefined);
            (recipeOperationsDB.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

            const result: MessageResponse = await recipeOperations.deleteRecipe('userId', 'recipeId');

            expect(result).toEqual({ message: 'Recipe deleted successfully' });
            expect(recipeOperationsDB.getRecipe).toHaveBeenCalledWith('recipeId');
            expect(firebaseStorageOperations.deleteImage).toHaveBeenCalledWith(hashString(mockRecipe.recipe.description));
            expect(recipeOperationsDB.deleteRecipe).toHaveBeenCalledWith('recipeId');
        });
    });

    describe('getRecipe', () => {
        it('should return the correct recipe for a given recipe ID', async () => {

            (recipeOperationsDB.getRecipe as jest.Mock).mockResolvedValue(mockRecipe);

            const result = await recipeOperations.getRecipe('recipeId');

            expect(result).toEqual(mockRecipe);
            expect(recipeOperationsDB.getRecipe).toHaveBeenCalledWith('recipeId');
        });
    });

});
