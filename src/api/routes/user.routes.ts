import express from 'express';
import * as userControllers from '../controllers/user.controller';
import type { MessageResponse } from '../../types/http.types';

const router = express.Router();

router.delete<{}, MessageResponse>(
    '/account',
    userControllers.deleteUser
)

export default router;
