import { Request, Response } from "express";
import env from "../../utils/env";


const stripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = env.STRIPE_WEBHOOK_SECRET;
    let event;
    // try {
    //     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    // } catch (err) {
    //     return res.status(400).send(`Webhook Error: ${err.message}`);
    // }
    // switch (event.type) {
    //     case 'checkout.session.completed':
    //         const session = event.data.object;
    //         // Fulfill the purchase...
    //         break;
    //     default:
    //         console.log(`Unhandled event type ${event.type}`);
    // }
    res.json({ received: true });
};

export default stripeWebhook;