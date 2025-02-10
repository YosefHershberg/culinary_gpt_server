import bodyParser from 'body-parser';
import express from 'express';
import clerkWebhook from '../webhooks/clerkWebhook';

const router = express.Router();

router.post(
    '/',
    bodyParser.raw({ type: "application/json" }),
    clerkWebhook
)

router.post(
    '/stripe',
    clerkWebhook
)

export default router;