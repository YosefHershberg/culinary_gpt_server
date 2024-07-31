import { WebhookEvent } from "@clerk/clerk-sdk-node";
import { Request, Response, NextFunction } from "express";
import userOperations from "../services/user.service";
import varifyCvixHeaders from "../../lib/varifyCvixHeaders";

const clerkWebhook = async function (req: Request, res: Response, next: NextFunction) {

    let evt: WebhookEvent;
    let message: string = '';

    try {
        evt = varifyCvixHeaders(req) as WebhookEvent;
    } catch (error: any) {
        console.log(error.message)
        return next(error)
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
                
                console.log('User created:', user.id)
                message = "Webhook received and user created successfully."
            } catch (error: any) {
                console.log('Error creating user:', error.message);
                return next(error)
            }
            break;

        case 'user.deleted':
            try {
                const user = await userOperations.deleteUser(evt.data.id as string);

                console.log('User deleted. clerk id:', user.id)

                message = "Webhook received and user deleted successfully."
            } catch (error: any) {
                console.log('Error deleting user:', error.message);
                return next(error)
            }
            break;

        case 'user.updated':
            try {
                const user = await userOperations.updateUser(evt.data.id as string, {
                    first_name: evt.data.first_name as string,
                    last_name: evt.data.last_name as string,
                    email: evt.data.email_addresses[0].email_address
                });

                console.log('User updated:', user.id)

                message = "Webhook received and user updated successfully."
            } catch (error: any) {
                console.log('Error updating user:', error.message);
                return next(error)
            }
            break;
        default:
            console.log('Webhook event not recognized:', evt.type)
    }

    return res.status(200).json({
        success: true,
        message,
    });
}

export default clerkWebhook;