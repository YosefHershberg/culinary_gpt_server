import { WebhookEvent } from "@clerk/clerk-sdk-node";
import { Request, Response } from "express";
import { HttpStatusCode } from "axios";

import userServices from "../services/user.service";
import verifyCvixHeaders from "../../lib/verifyCvixHeaders";
import logger from "../../config/logger";

const clerkWebhook = async (req: Request, res: Response) => {
    let evt: WebhookEvent;
    let message: string = '';

    try {
        evt = verifyCvixHeaders(req) as WebhookEvent;
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        return res.status(HttpStatusCode.BadRequest)
            .json({ success: false, message: 'Invalid webhook event' });
    }

    try {
        switch (evt.type) {
            case 'user.created':
                const createdUser = await userServices.createUser({
                    clerkId: evt.data.id,
                    first_name: evt.data.first_name as string,
                    last_name: evt.data.last_name as string,
                    email: evt.data.email_addresses[0].email_address,
                    isSubscribed: false,
                });

                logger.info('User created:', createdUser.id);
                message = "Webhook received and user created successfully.";
                break;

            case 'user.deleted':
                const deletedUser = await userServices.deleteUser(evt.data.id as string);
                logger.info('User deleted. clerk id:', deletedUser.id);
                message = "Webhook received and user deleted successfully.";
                break;

            case 'user.updated':
                const updatedUser = await userServices.updateUser(evt.data.id as string, {
                    first_name: evt.data.first_name as string,
                    last_name: evt.data.last_name as string,
                    email: evt.data.email_addresses[0].email_address
                });

                logger.info('User updated:', updatedUser.id);
                message = "Webhook received and user updated successfully.";
                break;

            default:
                logger.error('Webhook event not recognized:', evt.type);
                return res.status(400).json({ success: false, message: 'Unrecognized webhook event' });
        }

        return res.status(HttpStatusCode.Ok).json({ success: true, message });
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        return res.status(HttpStatusCode.InternalServerError).json({ success: false, message: 'An error occurred while processing the webhook' });
    }
};

export default clerkWebhook;