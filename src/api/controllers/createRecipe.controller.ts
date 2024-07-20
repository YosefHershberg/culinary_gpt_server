import { Response } from 'express';
import axios from 'axios';
import sharp from 'sharp';
import { z } from "zod";
import { StatusCodes } from 'http-status-codes';

import CustomRequest from '../../interfaces/CustomRequest';
import { Recipe } from '../../interfaces';
import User from '../models/User';
import openai from '../../utils/openai';
import { isValidJSON, compressBase64Image } from '../../utils/helperFunctions';

export const createRecipeSchema = z.object({
    body: z.object({
        mealSelected: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'dessert']),
        selectedTime: z.number().min(5).max(180),
        prompt: z.string(),
        numOfPeople: z.number().min(1).max(99),
    }),
});


const createRecipe = async (req: CustomRequest, res: Response) => {
    const { mealSelected, selectedTime, prompt, numOfPeople } = req.body;

    let kithchenUtils;
    let userIngredients;
    let recipe: Recipe | null = null;

    try {
        const user = await User.findOne({ clerkId: req.userId }).populate('ingredients').exec();
        kithchenUtils = user?.kitchenUtils;
        userIngredients = user?.ingredients.map((ingredient: any) => ingredient.name);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error accoured fetching user from DB' });
    }

    const maxRetries = 3;
    let attempts = 0;
    let isValidJson = false;

    while (attempts < maxRetries && !isValidJson) { // Retry until a valid JSON is generated
        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "user", content: `
                        create a recipe for ${mealSelected} that takes ${selectedTime} minutes
                        the following ingredients are available: ${userIngredients?.join(', ')}
                        with the following kitchen utilities: ${kithchenUtils}
                        the recipe should serve ${numOfPeople} people
                        add also keep in mind this - ${prompt}
                        the response that I want you to give me should VALID json that looks like this:
                        {
                            "title": "Recipe title",
                            "description": "Recipe description",
                            "ingredients": [{
                                "ingredient": "ingredient name and quantity",
                            }],
                            "steps": [{
                                "step": "step description",
                                "time": "time to complete the step"
                            }],
                            "time": "total time to complete the recipe",
                            "level": "difficulty level of the recipe (easy, medium, hard)",
                        }
                        NOTE: the json i want you to genarate must be a valid json object and without the backticks
                        `
                    }
                ],
                model: "gpt-3.5-turbo",
            });

            if (completion.choices[0].message.content) {
                isValidJson = isValidJSON(completion.choices[0].message.content);
                if (isValidJson) {
                    recipe = JSON.parse(completion.choices[0].message.content);
                } else {
                    attempts++;
                    if (attempts >= maxRetries) {
                        return res.status(400).json({ message: 'Invalid JSON after multiple attempts' });
                    }
                }
            } else {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
            }

        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error accourd while genarating the recipe' });
        }
    }

    let imageUrl

    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `A realistic photo of ${recipe?.title}`,
            n: 1,
            size: "1024x1024",
            response_format: 'b64_json',
        });
        imageUrl = response.data[0].b64_json;
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error accourd while genarating the image' });
    }

    const base64Image = await compressBase64Image(imageUrl as string, 30); //13 KB

    // for an image tag
    const base64DataUrl = `data:image/jpeg;base64,${base64Image}`;


    return res.json({ recipe, image_url: base64DataUrl });
}

export default createRecipe;