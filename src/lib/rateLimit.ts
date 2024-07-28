import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again after 5 minutes",
});

export default rateLimiter;