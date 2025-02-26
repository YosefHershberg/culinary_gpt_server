import { createUserDB, updateUserDB, UpdateUserDBProps } from "../../data-access/user.da";
import userServices from "../user.service";
import { mockUser } from "../../../lib/mock/mockData";

jest.mock('../../data-access/user.da');
jest.mock('../recipes.service');
jest.mock('../ingredients.service');
jest.mock('../firebase.service');
jest.mock('../../data-access/recipe.da');
jest.mock('../../data-access/kitchenUtils.da');

describe('user services', () => {

    describe('userServices.createUser', () => {
        it('should create a user successfully', async () => {

            (createUserDB as jest.Mock).mockResolvedValue(mockUser);

            const result = await userServices.createUser(mockUser);

            expect(createUserDB).toHaveBeenCalledWith(mockUser);

            // TODO: This should resolve with mockUserDoc
            expect(result).toEqual(mockUser);
        });
    });

    // TODO: fix this test. it takes too much time to run

    // describe('userServices.deleteUser', () => {
    //     it('should delete a user and related data successfully', async () => {
    //         const mockRecipes = [{ recipe: { description: 'recipe1' } }, { recipe: { description: 'recipe2' } }];

    //         (recipeServices.getUserPageRecipes as jest.Mock).mockResolvedValue(mockRecipes);
    //         (deleteUserDB as jest.Mock).mockResolvedValue(mockUser);
    //         (deleteUserRecipes as jest.Mock).mockResolvedValue(undefined);
    //         (deleteKitchenUtilsDB as jest.Mock).mockResolvedValue(undefined);
    //         (userIngredientServices.deleteAll as jest.Mock).mockResolvedValue(undefined);
    //         (firebaseStorageServices.deleteImage as jest.Mock).mockResolvedValue(undefined);

    //         const result = await userServices.deleteUser(userId);

    //         expect(recipeServices.getUserPageRecipes).toHaveBeenCalledWith(userId);
    //         expect(deleteUserDB).toHaveBeenCalledWith(userId);
    //         expect(deleteUserRecipes).toHaveBeenCalledWith(userId);
    //         expect(deleteKitchenUtilsDB).toHaveBeenCalledWith(userId);
    //         expect(userIngredientServices.deleteAll).toHaveBeenCalledWith(userId);
    //         expect(firebaseStorageServices.deleteImage).toHaveBeenCalledTimes(mockRecipes.length);
    //         expect(result).toEqual(mockUser);
    //     });
    // });

    describe('userServices.updateUser', () => {
        it('should update a user successfully', async () => {
            const userId = 'userId';
            const mockUpdate: UpdateUserDBProps = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                isSubscribed: false,
            };

            (updateUserDB as jest.Mock).mockResolvedValue(mockUser);

            const result = await userServices.updateUser(userId, mockUpdate);

            expect(updateUserDB).toHaveBeenCalledWith(userId, mockUpdate);
            expect(result).toEqual(mockUser);
        });
    });
})