import { createClerkClient } from "@clerk/express";
import env from "../utils/env";

const clerkClient = createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
});

export default clerkClient;