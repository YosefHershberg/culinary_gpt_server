
import { Response } from 'express';
import User from '../../models/user';
import CustomRequest from '../../interfaces/CustomRequest';

export const getIngredients = async (req: CustomRequest, res: Response) => {
    try {
        const user = await User.findOne({ clerkId: req.userId }).populate('ingredients').exec();
        if (!user) {
            throw new Error('User not found');
        }
        return res.json(user.ingredients);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const addIngredient = async (req: CustomRequest, res: Response) => {
    const ingredient = req.body;

    try {
        const user = await User.findOne({ clerkId: req.userId });
        if (!user) {
            throw new Error('User not found');
        }
        user.ingredients.push(ingredient.id);
        await user.save();
        return res.json(ingredient);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteIngredient = async (req: CustomRequest, res: Response) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ message: 'Invalid id' });
    }

    try {
        const user = await User.findOne({ clerkId: req.userId });
        if (!user) {
            throw new Error('User not found');
        }
        const newIngredients = user.ingredients.filter(ingredient => ingredient.toString() !== id);
        user.ingredients = newIngredients;
        await user.save();
        return res.json({ message: 'Ingredient deleted' });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getKitchenUtils = async (req: CustomRequest, res: Response) => {
    try {
        const user = await User.findOne({ clerkId: req.userId });
        if (!user) {
            throw new Error('User not found');
        }
        return res.json(user.kitchenUtils);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateKitchenUtils = async (req: CustomRequest, res: Response) => {
    const { name, value } = req.body;

    if (!name || !value) {
        return res.status(400).json({ message: 'Invalid kitchen utility' });
    }

    try {
        const user: any = await User.findOne({ clerkId: req.userId });
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.kitchenUtils) {
            user.kitchenUtils = {}; // Initialize if not exists
        }

        user.kitchenUtils[name] = value;
        await user.save();
        return res.json({ message: 'Kitchen utilities updated successfully' });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
