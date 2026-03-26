import bodyParser from 'body-parser';
import express from 'express';
import stripeWebhook from '../webhooks/stripe.webhook';

const router = express.Router();

router.post(
    '/stripe',
    bodyParser.raw({ type: 'application/json' }),
    stripeWebhook
)

export default router;
