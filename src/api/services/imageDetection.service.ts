import logger from "../../config/logger";
import visionClient from "../../config/vision";
import { compressBase64string, getStringSizeInKB } from "../../utils/helperFunctions";
import Ingredient, { IngredientDocument } from "../models/ingredient.model";

/**
 * @module vision.service
 * 
 * @description This module provides operations for extracting text from images using the Google Cloud Vision API
 * @exports visionOperations
 */

const imageDetectionOperations = {

    /**
     * @description This function gets the ingredients from the image and return the ones that are DB
     * @param base64image 
     * @returns {IngredientDocument[]}
     */
    getIngredientsFromImage: async (base64image: string): Promise<IngredientDocument[]> => {
        const pureBase64 = base64image.replace('data:image/jpeg;base64,', '');

        const labels = await imageDetectionOperations.detectLabels(pureBase64);

        if (labels.length === 0) return [];

        const ingredients = await imageDetectionOperations.getIngredientsFromLabels(labels);

        if (ingredients.length === 0) return [];

        return ingredients;
    },

    /**
     * @description This function detects labels in an image
     * @param {string} pureBase64 
     * @returns {string}
     */
    detectLabels: async (pureBase64: string): Promise<string[]> => {
        let res;

        try {
            const [result] = await visionClient.labelDetection({
                image: { content: pureBase64 },
            });
            res = result;
        } catch (error) {
            logger.error(error);
            console.log(error);
        }
        const labels = res?.labelAnnotations;
        return labels?.map(label => label.description) as string[];
    },

    /**
     * @description This function gets the ingredients from the labels
     * @param {string[]} labels 
     * @returns {IngredientDocument[]}
     */
    getIngredientsFromLabels: async (labels: string[]): Promise<IngredientDocument[]> => {
        const formattedLabels = labels.map(label =>
            label.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ')
        );
        const ingredients = await Ingredient.find({ name: { $in: formattedLabels } });

        return ingredients;
    }
}

export default imageDetectionOperations;