import { NextFunction, Response } from 'express';
import { z } from 'zod';
import { HttpStatusCode } from 'axios';

import CustomRequest from '../../interfaces/CustomRequest';

import { HttpError } from '../../lib/HttpError';
import logger from '../../config/logger';
import { IngredientDocument } from '../models/ingredient.model';
import imageDetectionOperations from '../services/imageDetection.service';

export const imageIngredientDetectorSchema = z.object({
    imageUrl: z.string()
});

export const imageIngredientDetector = async (req: CustomRequest, res: Response<IngredientDocument[]>, next: NextFunction): Promise<void> => {
    try {
        const imageUrl = req.body;

        const ingredients = await imageDetectionOperations.getIngredientsFromImage(imageUrl);

        res.status(HttpStatusCode.Ok).json(ingredients);
    } catch (error) {
        logger.error(error);
        next(new HttpError(HttpStatusCode.InternalServerError, 'Failed to analyze image'));
    }
};