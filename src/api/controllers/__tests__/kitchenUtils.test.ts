import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app, { userId } from '../../../lib/mock/mockApp';
import { kitchenUtilsOperations } from '../../services/kitchenUtils.service';
import { KitchenUtils } from '../../../interfaces';

jest.mock('../../services/kitchenUtils.service');

const mockKitchenUtils: KitchenUtils = {
    "Stove Top": true,
    "Oven": true,
    "Microwave": true,
    "Air Fryer": false,
    "Blender": false,
    "Food Processor": false,
    "Slow Cooker": false,
    "BBQ": true,
    "Grill": true,
};

describe('Kitchen Utils Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/user/kitchen-utils', () => {
        it('should return kitchen utils for a user', async () => {
            (kitchenUtilsOperations.get as jest.Mock).mockResolvedValue(mockKitchenUtils);

            const res = await request(app)
                .get('/api/user/kitchen-utils');

            expect(res.status).toBe(StatusCodes.OK);
            expect(res.body).toEqual(mockKitchenUtils);
            expect(kitchenUtilsOperations.get).toHaveBeenCalledWith(userId);
        });
    });

    describe('PATCH /api/user/kitchen-utils', () => {
        const updatePayload = {
            name: 'Oven',
            value: true
        };

        it('should update kitchen utils for a user', async () => {
            const mockMessage = { message: 'Kitchen utils updated successfully' };

            (kitchenUtilsOperations.update as jest.Mock).mockResolvedValue(mockMessage);

            const res = await request(app)
                .patch('/api/user/kitchen-utils')
                .send(updatePayload);

            expect(res.status).toBe(StatusCodes.OK);
            expect(res.body).toEqual(mockMessage);
            expect(kitchenUtilsOperations.update).toHaveBeenCalledWith(userId, updatePayload.name, updatePayload.value);
        });
    });

});
