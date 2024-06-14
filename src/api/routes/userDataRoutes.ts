import express, { Response } from 'express';
import Ingredient from '../../interfaces/Ingredient';
import MessageResponse from '../../interfaces/MessageResponse';
import User from '../../models/user';
import CustomRequest from '../../interfaces/CustomRequest';

const router = express.Router();

router.get<{}, Ingredient[]>('/ingredients', async (req: CustomRequest, res: Response) => {
    try {
        const user = await User.findOne({ clerkId: req.userId }).populate('ingredients').exec();
        return res.json(user?.$assertPopulated('ingredients').ingredients);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post<{}, Ingredient>('/ingredients', async (req: CustomRequest, res: Response) => {
    const ingredient = req.body;

    //TODO check if should use id here form params!!!

    try {
        const user = await User.findOne({ clerkId: req.userId })
        user?.ingredients.push(ingredient.id);
        await user?.save();
        return res.json(ingredient);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete<{ id: string }, MessageResponse>('/ingredients/:id', async (req: CustomRequest, res: Response) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ message: 'Invalid id' });
    }

    try {
        const user = await User.findOne({ clerkId: req.userId });
        //@ts-ignore
        if (user) {
            const newIngredients = user.ingredients.filter(ingredient => {
                return ingredient.toString() !== id;
            });
            // console.log(newIngredients);
            user.ingredients = newIngredients;
            await user.save();
        } else {
            throw new Error('User not found');
        }
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }

    return res.json({ message: 'Ingredient deleted' });
});

router.get<{}, string[]>('/kitchen-utils', async (req: CustomRequest, res: Response) => {
    try {
        const user = await User.findOne({ clerkId: req.userId });
        return res.json(user?.kitchenUtils);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
})

router.post<{}, string>('/kitchen-utils', async (req: CustomRequest, res: Response) => {
    const { name, value } = req.body;


    if ((name || value) === undefined) {
        return res.status(400).json({ message: 'Invalid kitchen utility' });
    }

    try {
        const user: any = await User.findOne({ clerkId: req.userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.kitchenUtils) {
            return res.status(400).json({ message: 'Kitchen utilities not found' });
        }

        user.kitchenUtils[name] = value;

        await user.save();

        return res.status(200).json({ message: 'Kitchen utilities updated successfully' });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }

});

export default router;