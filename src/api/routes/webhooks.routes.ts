import bodyParser from 'body-parser';
import express from 'express';
import clerkWebhook from '../webhooks/clerk.webhook';
import stripeWebhook from '../webhooks/stripe.webhook';

const router = express.Router();

router.post(
    '/clerk',
    bodyParser.raw({ type: "application/json" }),
    clerkWebhook
)

router.post(
    '/stripe',
    bodyParser.raw({ type: 'application/json' }),
    stripeWebhook
)

export default router;