import express from 'express';

import { validate } from '../../middlewares';

import * as kitchenUtilsController from '../controllers/kitchenUtils.controller';
import { KitchenUtils } from '../../types';
import { MessageResponse } from '../../types/http.types';

const router = express.Router();

router.get<{}, KitchenUtils | MessageResponse>(
    '/',
    kitchenUtilsController.getKitchenUtils
);

router.patch<{}, KitchenUtils | MessageResponse>(
    '/',
    validate(kitchenUtilsController.toggleKitchenUtilsSchema),
    kitchenUtilsController.toggleKitchenUtils
);

export default router;
