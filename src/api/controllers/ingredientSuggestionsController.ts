import { Request, Response } from 'express';
import Ingredient from '../../models/ingredient';

const categoryArr = [
    'common',
    'vegetables',
    'dairy',
    'spices',
    'carbs',
    'meat'
]

export const ingredientSuggestionsController = async (req: Request, res: Response) => {
    const { category } = req.params;

    if (!categoryArr.includes(category)) {
        return res.status(400).json({ message: 'Invalid category' });
    }

    try {
        const result = await Ingredient.find({ category })
        return res.status(200).json(result);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
}