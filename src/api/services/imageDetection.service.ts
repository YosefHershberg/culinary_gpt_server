import logger from "../../config/logger";
import openai from "../../config/openai";
import { isValidJSON } from "../../utils/helperFunctions";
import { getManyIngredientsByLabelsDB } from "../data-access/ingredient.da";
import { IngredientDocument } from "../models/ingredient.model";

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

        const labels = await imageDetectionOperations.detectLabels(base64image);

        if (labels.length === 0) return [];

        const ingredients = await getManyIngredientsByLabelsDB(labels);

        if (ingredients.length === 0) return [];

        return ingredients;
    },

    /**
     * @description This function detects labels in an image
     * @param {string} base64image 
     * @returns {string}
     */
    detectLabels: async (base64image: string): Promise<string[]> => {
        const maxRetries = 3;
        let attempts = 0;
        let isValidJson = false;

        let result: string[] = [];

        while (attempts < maxRetries && !isValidJson) { // Retry until a valid JSON is generated
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text", 
                                    text: `Send me the ingredients of this image.
                                        respond with a json in this format without backticks: 
                                        [
                                            "ingredient1", "ingredient2", "ingredient3"
                                        ]
                                        Note: make the ingredients first letter uppercase.
                                        Note: remove irrelevant words. (like "vanilla" from "vanilla ice cream")`
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        "url": base64image,
                                    },
                                }
                            ],
                        },
                    ],
                    max_tokens: 100,
                });
                const response = completion.choices[0].message.content as string;

                isValidJson = isValidJSON(response);

                if (isValidJson) {
                    result = JSON.parse(response);
                }
            } catch (error) {
                logger.error(error);
                attempts++;
            }

            if (!isValidJson) {
                throw new Error('No valid JSON response generated for cocktail recipe');
            }
        }
         
        return result
    },
}

export default imageDetectionOperations;