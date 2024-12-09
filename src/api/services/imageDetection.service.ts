import logger from "../../config/logger";
import visionClient from "../../config/vision";
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
     * @param imageURL 
     * @returns {IngredientDocument[]}
     */
    getIngredientsFromImage: async (imageURL: string): Promise<IngredientDocument[]> => {
        
        const labels = await imageDetectionOperations.detectLabels(imageURL);

        if (labels.length === 0) return [];

        const ingredients = await imageDetectionOperations.getIngredientsFromLabels(labels);

        if (ingredients.length === 0) return [];

        return ingredients;
    },

    /**
     * @description This function detects labels in an image
     * @param {string} imageURL 
     * @returns {string}
     */
    detectLabels: async (imageURL: string): Promise<string[]> => {
        let res;
        try {
            const [result] = await visionClient.labelDetection(imageURL);
            res = result;
        } catch (error) {
            logger.error(error);
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
        const ingredients = await Ingredient.find({ name: { $in: labels } });
        return ingredients;
    }
}

export default imageDetectionOperations;