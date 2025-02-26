import { getManyIngredientsByLabelsDB } from "../data-access/ingredient.da";
import { IngredientDocument } from "../models/ingredient.model";
import aiServices from "./ai.service";

/**
 * @module vision.service
 * 
 * @description This module provides Services for extracting text from images using the Google Cloud Vision API
 * @exports visionServices
 */

const imageDetectionServices = {

    /**
     * @description This function gets the ingredients from the image and return the ones that are DB
     * @param base64image 
     * @returns {IngredientDocument[]}
     */
    getIngredientsFromImage: async (base64image: string): Promise<IngredientDocument[]> => {
        const labels = await aiServices.detectLabels(base64image);

        if (labels.length === 0) return [];

        const ingredients = await getManyIngredientsByLabelsDB(labels);

        if (ingredients.length === 0) return [];

        return ingredients;
    },
}

export default imageDetectionServices;