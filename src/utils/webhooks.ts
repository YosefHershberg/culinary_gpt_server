import { WebhookEvent } from "@clerk/clerk-sdk-node";
import { Webhook } from "svix";
import User from "../models/XUser";
import { kitchenUtils } from "../data/kitchenUtils";
import { Request, Response, NextFunction } from "express";

export const clerkWebhooks = async function (req: Request, res: Response, next: NextFunction) {

    // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        throw new Error("You need a WEBHOOK_SECRET in your .env");
    }

    // Get the headers and body
    const headers = req.headers;
    const payload: unknown = req.body.toString();

    // Get the Svix headers for verification
    const svix_id = headers["svix-id"] as string;
    const svix_timestamp = headers["svix-timestamp"] as string;
    const svix_signature = headers["svix-signature"] as string;

    // If there are no Svix headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.log("Error occured -- no svix headers");
        return new Response("Error occured -- no svix headers", {
            status: 400,
        });
    }

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Attempt to verify the incoming webhook
    // If successful, the payload will be available from 'evt'
    // If the verification fails, error out and  return error code
    try {
        evt = wh.verify(payload as string, headers as any) as WebhookEvent;
    } catch (err: any) {
        console.log("Error verifying webhook:", err.message);
        return next(err);
    }

    if (evt.type === 'user.created') {
        console.log('userId:', evt.data.id)
        try {
            const user = new User({
                clerkId: evt.data.id,
                first_name: evt.data.first_name,
                last_name: evt.data.last_name,
                email: evt.data.email_addresses[0].email_address,
                ingredients: [],
                kitchenUtils: kitchenUtils
            });
            await user.save()
        } catch (error) {
            // @ts-ignore
            console.log('Error creating user:', error.message);
            return next(error)    
        }
    }

    // console.log("Webhook received:");
    
    return res.status(200).json({
        success: true,
        message: "Webhook received",
    });
}
