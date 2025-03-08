import recipeServices from '../../services/recipes.service';
import firebaseStorageServices from '../firebase.service';
import { RecipeWithImage } from '../../../types';
import { mockRecipe } from '../../../lib/mock/mockData';
import { base64ToArrayBuffer } from '../../../utils/helperFunctions';
import {MessageResponse} from '../../../types/http.types';
import { addRecipeDB, deleteRecipeDB, getRecipeDB, getAllRecipesDB, getRecipesPageDB } from '../../data-access/recipe.da';
import { userId } from '../../../lib/mock/mockApp';

jest.mock('../../data-access/recipe.da');
jest.mock('../firebase.service');
jest.mock('../../../utils/helperFunctions');

const mockRecipes: RecipeWithImage[] = [
    mockRecipe
];

describe('recipeServices', () => {

    describe('getUserPageRecipes', () => {
        it('should return the correct recipes for a given user ID', async () => {
            (getRecipesPageDB as jest.Mock).mockResolvedValueOnce(mockRecipes);

            const result = await recipeServices.getUserPageRecipes({
                userId,
                page: 1,
                limit: 10,
                filter: 'recipes',
                sort: 'a-z'
            });

            expect(result).toEqual(mockRecipes);
        });
    });

    describe('getAllUserRecipes', () => {
        it('should return the all recipes for a given user ID', async () => {
            (getAllRecipesDB as jest.Mock).mockResolvedValue(mockRecipes);

            const result = await recipeServices.getAllUserRecipes('userId');

            expect(result).toEqual(mockRecipes);
        });
    });

    describe('addRecipe', () => {
        it('should add a new recipe and return the added recipe', async () => {

            const mockImageBuffer = new ArrayBuffer(8);
            const mockImageUrl = 'mockImageUrl';

            (base64ToArrayBuffer as jest.Mock).mockReturnValue(mockImageBuffer);
            (firebaseStorageServices.uploadImage as jest.Mock).mockResolvedValue(mockImageUrl);
            (addRecipeDB as jest.Mock).mockResolvedValue(mockRecipe);

            const result = await recipeServices.addRecipe(mockRecipe);

            expect(result).toEqual(mockRecipe);
            expect(base64ToArrayBuffer).toHaveBeenCalledWith(mockRecipe.image_url.replace(/^data:image\/(png|jpeg);base64,/, ''));
            expect(firebaseStorageServices.uploadImage).toHaveBeenCalledWith(mockImageBuffer, 'recipe123');
            expect(addRecipeDB).toHaveBeenCalledWith({ ...mockRecipe, image_url: mockImageUrl });
        });
    });

    describe('deleteRecipe', () => {
        it('should delete the recipe and its associated image from storage', async () => {

            (getRecipeDB as jest.Mock).mockResolvedValue(mockRecipe);
            (firebaseStorageServices.deleteImage as jest.Mock).mockResolvedValue(undefined);
            (deleteRecipeDB as jest.Mock).mockResolvedValue(undefined);

            const result: MessageResponse = await recipeServices.deleteRecipe('recipeId');

            expect(result).toEqual({ message: 'Recipe deleted successfully' });
            expect(getRecipeDB).toHaveBeenCalledWith('recipeId');
            expect(firebaseStorageServices.deleteImage).toHaveBeenCalledWith(mockRecipe.recipe.id);
            expect(deleteRecipeDB).toHaveBeenCalledWith('recipeId');
        });
    });

    describe('getRecipe', () => {
        it('should return the correct recipe for a given recipe ID', async () => {

            (getRecipeDB as jest.Mock).mockResolvedValue(mockRecipe);

            const result = await recipeServices.getRecipeById('recipeId');

            expect(result).toEqual(mockRecipe);
            expect(getRecipeDB).toHaveBeenCalledWith('recipeId');
        });
    });

});
