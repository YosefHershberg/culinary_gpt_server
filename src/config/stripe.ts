import Stripe from "stripe";
import env from "../utils/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.acacia',
    typescript: true,
});

export default stripe;
