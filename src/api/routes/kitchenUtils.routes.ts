import express from 'express';

import { validate } from '../../middlewares';

import * as kitchenUtilsControllers from '../controllers/kitchenUtils.controller';
import type { KitchenUtils, MessageResponse } from '../../types';

const router = express.Router();

router.get<{}, KitchenUtils | MessageResponse>(
    '/',
    kitchenUtilsControllers.getKitchenUtils
);

router.patch<{}, KitchenUtils | MessageResponse>(
    '/',
    validate(kitchenUtilsControllers.toggleKitchenUtilsSchema),
    kitchenUtilsControllers.toggleKitchenUtils
);

export default router;
