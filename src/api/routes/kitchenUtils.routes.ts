import express from 'express';

import { validate } from '../../middlewares';

import * as kitchenUtilsControllers from '../controllers/kitchenUtils.controller';
import type { KitchenUtilsModel } from '../../generated/prisma/models';
import type { MessageResponse } from '../../types';

const router = express.Router();

router.get<{}, KitchenUtilsModel | MessageResponse>(
    '/',
    kitchenUtilsControllers.getKitchenUtils
);

router.patch<{}, KitchenUtilsModel | MessageResponse>(
    '/',
    validate(kitchenUtilsControllers.toggleKitchenUtilsSchema),
    kitchenUtilsControllers.toggleKitchenUtils
);

export default router;
