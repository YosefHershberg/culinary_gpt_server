import express from 'express';
import * as userSubscriptionControllers from '../controllers/userSubscription.controller';
import MessageResponse from '../../interfaces/MessageResponse';
import { isSubscriptionActive } from '../controllers/userSubscription.controller';

const router = express.Router();

router.get<{}, isSubscriptionActive | MessageResponse>(
    '/isSubscribed',
    userSubscriptionControllers.getUserSubscription
)

export default router;
