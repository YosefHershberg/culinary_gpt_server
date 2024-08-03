import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app, { userId } from '../lib/mock/mockApp';
import { kitchenUtilsOperations } from '../api/services/kitchenUtils.service';
import { KitchenUtils } from '../interfaces';
import { connectToDatabase, disconnectFromDatabase } from '../config/database';

jest.mock('../api/services/kitchenUtils.service');

//@ts-expect-error
const mockKitchenUtils: KitchenUtils = {
    // Fill this with the actual structure of your KitchenUtils
};

describe('Kitchen Utils Controller', () => {
    describe('GET /api/kitchen-utils', () => {
        it('should return kitchen utils for a user', async () => {
            (kitchenUtilsOperations.get as jest.Mock).mockResolvedValue(mockKitchenUtils);

            const res = await request(app)
                .get('/api/user/kitchen-utils');

            expect(res.status).toBe(StatusCodes.OK);
            expect(res.body).toEqual(mockKitchenUtils);
            expect(kitchenUtilsOperations.get).toHaveBeenCalledWith(userId);
        });
    });

    // describe('PATCH /api/kitchen-utils', () => {
    //     const updatePayload = {
    //         name: 'Oven',
    //         value: true
    //     };

    //     it('should update kitchen utils for a user', async () => {
    //         const mockMessage = { message: 'Kitchen utils updated successfully' };

    //         (kitchenUtilsOperations.update as jest.Mock).mockResolvedValue(mockMessage);

    //         const res = await request(app)
    //             .patch('/api/kitchen-utils')
    //             .send(updatePayload);

    //         expect(res.status).toBe(StatusCodes.OK);
    //         expect(res.body).toEqual(mockMessage);
    //         expect(kitchenUtilsOperations.update).toHaveBeenCalledWith(userId, updatePayload.name, updatePayload.value);
    //     });

    //     it('should handle errors when updating kitchen utils', async () => {
    //         const userId = 'testUserId';
    //         (kitchenUtilsOperations.update as jest.Mock).mockRejectedValue(new Error('Error updating kitchen utils'));

    //         const res = await request(app)
    //             .patch('/api/kitchen-utils')
    //             .send(updatePayload);

    //         expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    //         expect(res.body).toHaveProperty('message', 'An error accrued while updating Kitchen Utils');
    //     });
    // });
});
