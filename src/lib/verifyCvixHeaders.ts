import { Webhook } from "svix";
import env from "../utils/env";
import logger from "../config/logger";
import { type WebhookEvent } from "@clerk/clerk-sdk-node";
import { type Request } from "express"

const verifyCvixHeaders = (req: Request) => {

    const WEBHOOK_SECRET = env.WEBHOOK_SECRET;
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
        logger.error("Error occured -- no svix headers");
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
        logger.error("Error verifying webhook:", err.message);
        throw new Error(err)
    }

    return evt
}

export default verifyCvixHeaders