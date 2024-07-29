import { createClerkClient } from "@clerk/clerk-sdk-node";
import env from "../lib/env";

const clerkClient = createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
});

export default clerkClient;