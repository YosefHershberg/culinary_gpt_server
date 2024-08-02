import express from 'express';

import { validate } from '../../middlewares';

import * as kitchenUtilsController from '../controllers/kitchenUtils.controller';
import { KitchenUtils } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';

const router = express.Router();

router.get<{}, KitchenUtils | MessageResponse>(
    '/',
    kitchenUtilsController.getKitchenUtils
);

router.post<{}, KitchenUtils | MessageResponse>(
    '/',
    validate(kitchenUtilsController.updateKitchenUtilsSchema),
    kitchenUtilsController.updateKitchenUtils
);

export default router;
