import axios from "axios";

import logger from "../../config/logger";
import env from "../../utils/env";
import gemini from "../../config/gemini";
import { createUserContent, type Schema, Type } from "@google/genai";

const MAX_RETRIES = 5;

const aiServices = {

    /**
     * @description This function creates a object with the gemini api
     * @param prompt 
     * @param schema 
     * @returns {TResponse}
     */
    geminiCreate: async <TResponse>(prompt: string, schema: Schema): Promise<TResponse> => {

        let result: TResponse;

        try {
            const response = await gemini.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                },
            });

            result = JSON.parse(response.text as string);
        } catch (error) {
            logger.error(error);
        }

        return result! as TResponse;
    },

    /**
     * @description This function detects labels in an image
     * @param {string} base64image 
     * @returns {string}
     */
    detectLabels: async (base64image: string): Promise<string[]> => {

        const imageParts = [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64image.split(",")[1], // Remove the data URL prefix
                },
            },
        ];

        let response
        try {
            response = await gemini.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: createUserContent([
                    `Send me the ingredients of this image.
                    Note: make the ingredients first letter uppercase.
                    Note: remove irrelevant words. (like "vanilla" from "vanilla ice cream")`,
                    ...imageParts,
                ]),
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                },
            });
        } catch (error) {
            logger.error(error);
        }

        if (!response?.text) {
            throw new Error("Response text is undefined");
        }

        return JSON.parse(response.text);
    },

    /**
     * @description This function creates an image using GetimgAI API
     * @param {string} imagePrompt
     * @returns {string} base64 image
     */
    createImageGetimgAI: async (imagePrompt: string): Promise<string> => {
        const url = 'https://api.getimg.ai/v1/flux-schnell/text-to-image';
        const headers = {
            Authorization: `Bearer ${env.GETIMGAI_API_KEY}`,
        };

        let base64Image = '';

        try {
            const { data } = await axios.post(url, {
                prompt: imagePrompt,
            }, { headers });
            base64Image = data.image;
        } catch (error) {
            logger.error(error);
        }

        return base64Image;
    }
}

export default aiServices;