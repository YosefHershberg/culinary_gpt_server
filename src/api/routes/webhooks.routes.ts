import bodyParser from 'body-parser';
import express from 'express';
import clerkWebhook from '../webhooks/clerk.webhook';

const router = express.Router();

router.post(
    '/clerk',
    bodyParser.raw({ type: "application/json" }),
    clerkWebhook
)

router.post(
    '/stripe',
    clerkWebhook
)

export default router;