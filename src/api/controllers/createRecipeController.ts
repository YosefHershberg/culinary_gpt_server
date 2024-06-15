import { Response } from 'express';
import User from '../../models/user';
import CustomRequest from '../../interfaces/CustomRequest';
import openai from '../../utils/openai';

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
}

const createRecipeController = async (req: CustomRequest, res: Response) => {
    const { mealSelected, selectedTime, prompt } = req.body;

    let kithchenUtils;
    let userIngredients;
    let recipe: Recipe;
    let image_url;

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

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    "role": "user", "content": `
                    create a recipe for ${mealSelected} that takes ${selectedTime} minutes
                    with the following ingredients: ${userIngredients?.join(', ')}
                    with the following kitchen utilities: ${kithchenUtils}
                    add also keep in mind this - ${prompt}
                    the response that I want you to give me should be a json with double-quoted property name in the JSON object that looks like this:
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
                    }
                    ` },
            ],
            model: "gpt-3.5-turbo",
        });
        if (completion.choices[0].message.content) {
            recipe = JSON.parse(completion.choices[0].message.content)

        } else {
            return res.status(500).json({ message: 'Internal server error' });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }

    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `A realistic photo of ${recipe.title}`,
            n: 1,
            size: "1024x1024",
        });
        image_url = response.data[0].url;
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }

    return res.json({ recipe, image_url });
}

export default createRecipeController;