import kitchenUtilsOperations from '../../services/kitchenUtils.service';
import {  userId } from '../../../lib/mock/mockApp';
import {  mockKitchenUtils } from '../../../lib/mock/mockData';
import { getKitchenUtilsDB, toggleKitchenUtilDB } from '../../data-access/kitchenUtils.da';

jest.mock('../../data-access/user.da');
jest.mock('../../data-access/kitchenUtils.da');

describe('kitchenUtilsOperations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('get', () => {
        it('should return the kitchen utilities for the user', async () => {
            
            (getKitchenUtilsDB as jest.Mock).mockResolvedValue(mockKitchenUtils);

            const result = await kitchenUtilsOperations.get(userId);

            expect(getKitchenUtilsDB).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockKitchenUtils);
        });
    });

    describe('toggle', () => {
        it('should update the kitchen utility and return the updated kitchen utilities', async () => {
            const updatedKitchenUtils = { ...mockKitchenUtils, Microwave: true }; // Expected result after toggle
    
            const mockResponse = { kitchenUtils: updatedKitchenUtils };
            
            // Mock the toggleKitchenUtilDB function
            (toggleKitchenUtilDB as jest.Mock).mockResolvedValue(mockResponse);
            
            const utilityName = 'Microwave';
    
            const result = await kitchenUtilsOperations.toggle(userId, utilityName);
    
            expect(toggleKitchenUtilDB).toHaveBeenCalledWith(userId, utilityName);
            expect(result).toEqual(updatedKitchenUtils);
        });
    });
});
