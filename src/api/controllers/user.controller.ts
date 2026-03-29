import { HttpStatusCode } from "axios";
import userServices from "../services/user.service";
import logger from "../../config/logger";
import { HttpError } from "../../lib/HttpError";
import { supabaseAdmin } from "../../config/supabase";

import type { NextFunction, Response } from "express";
import type { CustomRequest, MessageResponse } from "../../types";

export const deleteUser = async (req: CustomRequest, res: Response<MessageResponse>, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        await userServices.deleteUser(userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        next(new HttpError(
            HttpStatusCode.InternalServerError,
            'An error occurred while deleting the user account',
        ));
    }
}
