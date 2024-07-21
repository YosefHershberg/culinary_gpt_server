import express from 'express';

import { validate } from '../../middlewares';

import * as kithchenUtilsController from '../controllers/kithchenUtils.controller';

const router = express.Router();

// KITCHEN UTILS ------------------------------------------------------------

router.get(
    '/',
    kithchenUtilsController.getKitchenUtils
);

router.post(
    '/',
    validate(kithchenUtilsController.updateKitchenUtilsSchema),
    kithchenUtilsController.updateKitchenUtils
);

export default router;
