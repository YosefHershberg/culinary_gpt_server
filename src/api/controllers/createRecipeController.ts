import { Response } from 'express';
import User from '../../models/user';
import CustomRequest from '../../interfaces/CustomRequest';
import openai from '../../utils/openai';
import axios from 'axios';
import sharp from 'sharp';
import { isValidJSON } from '../../utils/helperFunctions';

type Recipe = {
    title: string,
    description: string,
    ingredients: {
        ingredient: string,
    }[],
    steps: {
        step: string,
        time: string,
    }[],
    time: string,
    level: string
}

const createRecipeController = async (req: CustomRequest, res: Response) => {
    const { mealSelected, selectedTime, prompt, numOfPeople } = req.body;

    let kithchenUtils;
    let userIngredients;
    let recipe: Recipe | null = null;

    if (!mealSelected || !selectedTime) {
        console.log(mealSelected, selectedTime, prompt);
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const user = await User.findOne({ clerkId: req.userId }).populate('ingredients').exec();
        kithchenUtils = user?.kitchenUtils;
        userIngredients = user?.ingredients.map((ingredient: any) => ingredient.name);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal server error' });
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
                        NOTE: the json i want you to genarate must be a valid json object
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
                return res.status(500).json({ message: 'Internal server error' });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    console.log(attempts);

    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `A realistic photo of ${recipe?.title}`,
            n: 1,
            size: "1024x1024",
        });
        const imageUrl = response.data[0].url;

        // Download the image
        const imageResponse = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        // Compress the image using sharp
        const compressedImageBuffer = await sharp(imageResponse.data)
            .resize({ width: 300 })
            .toFormat('jpeg', { quality: 20 })
            .toBuffer();

        // Convert the compressed image data to Base64
        const base64Image = compressedImageBuffer.toString('base64');

        // Optional: create a data URL if you need it for an image tag
        const base64DataUrl = `data:image/jpeg;base64,${base64Image}`;

        return res.json({ recipe, image_url: base64DataUrl });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default createRecipeController;