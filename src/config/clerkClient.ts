import { createClerkClient } from "@clerk/clerk-sdk-node";
import env from "./env";

const clerkClient = createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
});

export default clerkClient;