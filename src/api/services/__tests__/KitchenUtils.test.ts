import { kitchenUtilsOperations } from '../../services/kitchenUtils.service';
import { getUserDB } from '../../data-access/user.da';
import {  userId } from '../../../lib/mock/mockApp';
import {  mockKitchenUtils } from '../../../lib/mock/mockData';

jest.mock('../../data-access/user.da');

describe('kitchenUtilsOperations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('get', () => {
        it('should return the kitchen utilities for the user', async () => {
            
            const mockUser = { kitchenUtils: mockKitchenUtils };
            (getUserDB as jest.Mock).mockResolvedValue(mockUser);

            const result = await kitchenUtilsOperations.get(userId);

            expect(getUserDB).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockKitchenUtils);
        });
    });

    describe('update', () => {
        it('should update the kitchen utility and return the updated kitchen utilities', async () => {
            
            const mockUser = { kitchenUtils: { ...mockKitchenUtils }, save: jest.fn() };
            (getUserDB as jest.Mock).mockResolvedValue(mockUser);

            const updatedValue = true;
            const utilityName = 'Microwave';

            const result = await kitchenUtilsOperations.update(userId, utilityName, updatedValue);

            expect(getUserDB).toHaveBeenCalledWith(userId);
            expect(mockUser.kitchenUtils[utilityName]).toBe(updatedValue);
            expect(mockUser.save).toHaveBeenCalled();
            expect(result).toEqual(mockUser.kitchenUtils);
        });
    });
});
