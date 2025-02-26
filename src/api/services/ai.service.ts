import axios from "axios";
import logger from "../../config/logger";
import openai from "../../config/openai";
import env from "../../utils/env";
import { isValidJSON } from "../../utils/helperFunctions";

const MAX_RETRIES = 5;

const aiOperations = {

    openaiCreate: async <T>(prompt: string): Promise<T> => {
        let attempts = 0;
        let isValidJson = false;
        let result: T;

        while (attempts < MAX_RETRIES && !isValidJson) { // Retry until a valid JSON is generated
            try {

                const before = Date.now();
                console.log('before: ', before);
                
                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: "Your responses must always be a valid JSON object without any additional text or explanations." },
                        {
                            role: "user",
                            content: prompt
                        }],
                    model: "gpt-4-turbo",
                });

                const after = Date.now();
                console.log(`created in ${after - before}ms`);

                const response = completion.choices[0].message.content as string;

                isValidJson = isValidJSON(response);

                if (isValidJson) {
                    result = JSON.parse(response) as T;
                }
            } catch (error) {
                logger.error(error);
            } finally {
                console.log('Attempts: ', attempts);
                attempts++;
            }
        }

        if (!isValidJson) {
            throw new Error('No valid JSON response generated for cocktail recipe');
        }

        return result!;
    },

    /**
     * @description This function detects labels in an image
     * @param {string} base64image 
     * @returns {string}
     */
    detectLabels: async (base64image: string): Promise<string[]> => {
        const MAX_RETRIES = 3;
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

        const { data } = await axios.post(url, {
            prompt: imagePrompt,
        }, { headers });

        return data.image;
    }
}

export default aiOperations;