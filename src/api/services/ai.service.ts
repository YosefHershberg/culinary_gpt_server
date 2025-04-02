import axios from "axios";

import logger from "../../config/logger";
import openai from "../../config/openai";
import env from "../../utils/env";
import { isValidJSON } from "../../utils/helperFunctions";
import gemini from "../../config/gemini";
import { type Schema } from "@google/genai";

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
        let attempts = 0;
        let isValidJson = false;

        let result: string[] = [];

        while (attempts < MAX_RETRIES && !isValidJson) { // Retry until a valid JSON is generated
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
            } finally {
                attempts++;
            }

            if (!isValidJson) {
                throw new Error('No valid JSON response generated for cocktail recipe');
            }
        }

        return result
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