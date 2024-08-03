import { z } from "zod";

export const doSomethingByIdSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});