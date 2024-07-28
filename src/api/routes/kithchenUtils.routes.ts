import express from 'express';

import { validate } from '../../middlewares';

import * as kithchenUtilsController from '../controllers/kithchenUtils.controller';
import { KitchenUtils } from '../../interfaces';
import MessageResponse from '../../interfaces/MessageResponse';

const router = express.Router();

router.get<{}, KitchenUtils | MessageResponse>(
    '/',
    kithchenUtilsController.getKitchenUtils
);

router.post<{}, KitchenUtils | MessageResponse>(
    '/',
    validate(kithchenUtilsController.updateKitchenUtilsSchema),
    kithchenUtilsController.updateKitchenUtils
);

export default router;
