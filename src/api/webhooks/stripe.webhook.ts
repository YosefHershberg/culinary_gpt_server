import { Request, Response } from "express";
import env from "../../utils/env";
import Stripe from "stripe";
import logger from "../../config/logger";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.acacia',
    typescript: true,
});

const stripeWebhook = async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    // Verify the webhook signature
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).json({ error: err.message });
    }

    const data = event.data;
    const eventType = event.type;

    try {
        switch (eventType) {
            case 'customer.subscription.created': {
                // New subscription created
                const subscription = data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;
                const subscriptionId = subscription.id;

                // Update user in the database
                // await userService.updateUserSubscription(customerId, {
                //     subscriptionId,
                //     status: 'active',
                //     plan: subscription.items.data[0].plan.id,
                //     currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                // });

                break;
            }

            case 'customer.subscription.updated': {
                // Subscription updated
                const subscription = data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;
                const subscriptionId = subscription.id;

                // Update user in the database
                // await userService.updateUserSubscription(customerId, {
                //     subscriptionId,
                //     status: subscription.status,
                //     plan: subscription.items.data[0].plan.id,
                //     currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                // });

                break;
            }

            case 'customer.subscription.deleted': {
                // Subscription canceled or expired
                const subscription = data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Update user in the database
                // await userService.updateUserSubscription(customerId, {
                //     subscriptionId: null,
                //     status: 'canceled',
                //     plan: null,
                //     currentPeriodEnd: null,
                // });

                break;
            }

            case 'checkout.session.completed': {
                // Checkout session completed
                const checkoutSession = data.object as Stripe.Checkout.Session;
                
                // Extract the client_reference_id (user ID) from the checkout session
                const userId = checkoutSession.client_reference_id;
                
                if (!userId) {
                    console.error('No client_reference_id found in checkout session');
                    break;
                }

                const customerId = checkoutSession.customer as string;
                const subscriptionId = checkoutSession.subscription as string;

                // Update user in the database using the userId
                // await userService.updateUserSubscription(userId, {
                //     subscriptionId,
                //     status: 'active',
                //     plan: checkoutSession.display_items[0].plan.id,
                //     currentPeriodEnd: new Date(checkoutSession.current_period_end * 1000),
                // });

                break;
            }

            default:
                console.log(`Unhandled event type: ${eventType}`);
        }
    } catch (err: any) {
        console.error(`Error handling event: ${err.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    return res.json({ received: true });
};

export default stripeWebhook;