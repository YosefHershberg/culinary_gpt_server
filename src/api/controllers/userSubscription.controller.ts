import { NextFunction, Response } from "express";
import { HttpStatusCode } from "axios";

import userServices from "../services/user.service";
import logger from "../../config/logger";

import { HttpError } from "../../lib/HttpError";
import { CustomRequest } from "../../types";

/**
 * @openapi
 * paths:
 *   /api/user/subscription:
 *     get:
 *       tags:
 *         - User Subscription
 *       summary: Checks if the user's subscription is active
 *       description: Returns the subscription status of the user
 *       responses:
 *         '200':
 *           description: Subscription status retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   subscriptionActive:
 *                     type: boolean
 *         '400':
 *           description: Bad request
 *         '500':
 *           description: Internal server error
 */

export type isSubscriptionActive = {
    subscriptionActive: boolean;
}

export const getUserSubscription = async (req: CustomRequest, res: Response<isSubscriptionActive>, next: NextFunction) => {
    const { userId } = req

    try {
        const isSubscribed = await userServices.isSubscribed(userId as string);

        return res.status(200).json({ subscriptionActive: isSubscribed });
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(
            HttpStatusCode.InternalServerError,
            'An error occurred while checking the subscription status',
        ));
    }
}
