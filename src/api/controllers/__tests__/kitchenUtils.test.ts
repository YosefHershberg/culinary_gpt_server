import request from 'supertest';
import { HttpStatusCode } from 'axios';
import app, { userId } from '../../../lib/mock/mockApp';
import kitchenUtilsServices from '../../services/kitchenUtils.service';
import { KitchenUtils } from '../../schemas/kitchenUtils.schema';

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

    describe('GET /api/user/kitchen-utils', () => {
        it('should return kitchen utils for a user', async () => {
            (kitchenUtilsServices.get as jest.Mock).mockResolvedValue(mockKitchenUtils);

            const res = await request(app)
                .get('/api/user/kitchen-utils');

            expect(res.status).toBe(HttpStatusCode.Ok);
            expect(res.body).toEqual(mockKitchenUtils);
            expect(kitchenUtilsServices.get).toHaveBeenCalledWith(userId);
        });
    });

    describe('PATCH /api/user/kitchen-utils', () => {
        const updatePayload = {
            name: 'Oven',
        };

        it('should update kitchen utils for a user', async () => {
            const mockMessage = { message: 'Kitchen utils updated successfully' };

            (kitchenUtilsServices.toggle as jest.Mock).mockResolvedValue(mockMessage);

            const res = await request(app)
                .patch('/api/user/kitchen-utils')
                .send(updatePayload);

            expect(res.status).toBe(HttpStatusCode.Ok);
            expect(res.body).toEqual(mockMessage);
            expect(kitchenUtilsServices.toggle).toHaveBeenCalledWith(userId, updatePayload.name);
        });
    });

});
