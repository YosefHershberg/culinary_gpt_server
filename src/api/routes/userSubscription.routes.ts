import express from 'express';
import * as userSubscriptionControllers from '../controllers/userSubscription.controller';
import type { MessageResponse } from '../../types/http.types';

const router = express.Router();

router.get<{}, userSubscriptionControllers.IsSubscriptionActive | MessageResponse>(
    '/isSubscribed',
    userSubscriptionControllers.getUserSubscription
)

export default router;
