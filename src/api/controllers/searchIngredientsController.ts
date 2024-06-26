import { Response } from 'express';
import CustomRequest from '../../interfaces/CustomRequest';
import Ingredient from '../../models/XIngredient';

const searchIngredientsController = async (req: CustomRequest, res: Response) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'No query provided' });
    }

    try {
        const ingredients = await Ingredient.find({ name: { $regex: query, $options: 'i' } });
        return res.json(ingredients);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }

};

export default searchIngredientsController;
