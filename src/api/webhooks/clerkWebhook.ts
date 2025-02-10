import { WebhookEvent } from "@clerk/clerk-sdk-node";
import { Request, Response, NextFunction } from "express";
import userOperations from "../services/user.service";
import verifyCvixHeaders from "../../lib/verifyCvixHeaders";
import logger from "../../config/logger";
import { HttpError } from "../../lib/HttpError";

const clerkWebhook = async (req: Request, res: Response, next: NextFunction) => {

    let evt: WebhookEvent;
    let message: string = '';

    try {
        evt = verifyCvixHeaders(req) as WebhookEvent;
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message)
        }
        return next(new HttpError(400, 'Invalid webhook event'))
    }

    switch (evt.type) {
        case 'user.created':
            try {
                const user = await userOperations.createUser({
                    clerkId: evt.data.id,
                    first_name: evt.data.first_name as string,
                    last_name: evt.data.last_name as string,
                    email: evt.data.email_addresses[0].email_address
                });

                logger.info('User created:', user.id)
                message = "Webhook received and user created successfully."
            } catch (error) {
                if (error instanceof Error) {
                    logger.error(error.message)
                }
                next(new HttpError(500, 'An error accrued while creating a user'))
            }
            break;

        case 'user.deleted':
            console.log('User deleted:', evt.data.id);
            try {
                const user = await userOperations.deleteUser(evt.data.id as string);

                logger.info('User deleted. clerk id:', user.id)

                message = "Webhook received and user deleted successfully."
            } catch (error) {
                if (error instanceof Error) {
                    logger.error(error.message)
                }
                next(new HttpError(500, 'An error accrued while deleting a user'))
            }
            break;

        case 'user.updated':
            try {
                const user = await userOperations.updateUser(evt.data.id as string, {
                    first_name: evt.data.first_name as string,
                    last_name: evt.data.last_name as string,
                    email: evt.data.email_addresses[0].email_address
                });

                logger.info('User updated:', user.id)

                message = "Webhook received and user updated successfully."
            } catch (error) {
                if (error instanceof Error) {
                    logger.error(error.message)
                }
                next(new HttpError(500, 'An error accrued while updating a user'))
            }
            break;
        default:
            logger.error('Webhook event not recognized:', evt.type)
    }

    return res.status(200).json({
        success: true,
        message,
    });
}

export default clerkWebhook;