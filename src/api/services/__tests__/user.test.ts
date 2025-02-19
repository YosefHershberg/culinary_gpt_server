import { createUserDB, updateUserDB, UpdateUserDBProps } from "../../data-access/user.da";
import userOperations from "../user.service";
import { mockUser } from "../../../lib/mock/mockData";

jest.mock('../../data-access/user.da');
jest.mock('../recipes.service');
jest.mock('../ingredients.service');
jest.mock('../firebase.service');
jest.mock('../../data-access/recipe.da');
jest.mock('../../data-access/kitchenUtils.da');

describe('user services', () => {

    describe('userOperations.createUser', () => {
        it('should create a user successfully', async () => {

            (createUserDB as jest.Mock).mockResolvedValue(mockUser);

            const result = await userOperations.createUser(mockUser);

            expect(createUserDB).toHaveBeenCalledWith(mockUser);

            // TODO: This should resolve with mockUserDoc
            expect(result).toEqual(mockUser);
        });
    });

    // TODO: fix this test. it takes too much time to run

    // describe('userOperations.deleteUser', () => {
    //     it('should delete a user and related data successfully', async () => {
    //         const mockRecipes = [{ recipe: { description: 'recipe1' } }, { recipe: { description: 'recipe2' } }];

    //         (recipeOperations.getUserPageRecipes as jest.Mock).mockResolvedValue(mockRecipes);
    //         (deleteUserDB as jest.Mock).mockResolvedValue(mockUser);
    //         (deleteUserRecipes as jest.Mock).mockResolvedValue(undefined);
    //         (deleteKitchenUtilsDB as jest.Mock).mockResolvedValue(undefined);
    //         (userIngredientOperations.deleteAll as jest.Mock).mockResolvedValue(undefined);
    //         (firebaseStorageOperations.deleteImage as jest.Mock).mockResolvedValue(undefined);

    //         const result = await userOperations.deleteUser(userId);

    //         expect(recipeOperations.getUserPageRecipes).toHaveBeenCalledWith(userId);
    //         expect(deleteUserDB).toHaveBeenCalledWith(userId);
    //         expect(deleteUserRecipes).toHaveBeenCalledWith(userId);
    //         expect(deleteKitchenUtilsDB).toHaveBeenCalledWith(userId);
    //         expect(userIngredientOperations.deleteAll).toHaveBeenCalledWith(userId);
    //         expect(firebaseStorageOperations.deleteImage).toHaveBeenCalledTimes(mockRecipes.length);
    //         expect(result).toEqual(mockUser);
    //     });
    // });

    describe('userOperations.updateUser', () => {
        it('should update a user successfully', async () => {
            const userId = 'userId';
            const mockUpdate: UpdateUserDBProps = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                isSubscribed: false,
            };

            (updateUserDB as jest.Mock).mockResolvedValue(mockUser);

            const result = await userOperations.updateUser(userId, mockUpdate);

            expect(updateUserDB).toHaveBeenCalledWith(userId, mockUpdate);
            expect(result).toEqual(mockUser);
        });
    });
})