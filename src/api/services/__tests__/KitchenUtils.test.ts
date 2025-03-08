import kitchenUtilsServices from '../../services/kitchenUtils.service';
import { userId } from '../../../lib/mock/mockApp';
import { mockKitchenUtils } from '../../../lib/mock/mockData';
import { getKitchenUtilsDB, toggleKitchenUtilDB } from '../../data-access/kitchenUtils.da';

jest.mock('../../data-access/user.da');
jest.mock('../../data-access/kitchenUtils.da');

describe('kitchenUtilsServices', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('get', () => {
        it('should return the kitchen utilities for the user', async () => {

            (getKitchenUtilsDB as jest.Mock).mockResolvedValue(mockKitchenUtils);

            const result = await kitchenUtilsServices.get(userId);

            expect(getKitchenUtilsDB).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockKitchenUtils);
        });
    });

    describe('toggle', () => {
        it('should update the kitchen utility and return the updated kitchen utilities', async () => {

            // Mock the toggleKitchenUtilDB function
            (toggleKitchenUtilDB as jest.Mock).mockResolvedValue(mockKitchenUtils);

            const utilityName = 'Microwave';

            const result = await kitchenUtilsServices.toggle(userId, utilityName);

            expect(toggleKitchenUtilDB).toHaveBeenCalledWith(userId, utilityName);
            expect(result).toEqual(mockKitchenUtils);
        });
    });
});
