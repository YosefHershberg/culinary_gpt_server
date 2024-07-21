import { Response } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import User from '../models/user.model';
import Recipe from '../models/recipe.model';

import CustomRequest from '../../interfaces/CustomRequest';
import { doSomethingByIdSchema } from '../validations';
import { recipeSchema } from '../validations';

// RECIPES -----------------------------------------------------------------

export const getRecipes = async (req: CustomRequest, res: Response) => {
    try {
        const user = await User.findOne({ clerkId: req.userId }).populate('recipes').exec();

        if (!user) {
            throw new Error('User not found');
        }

        user.recipes = user.recipes as any; // Update the type of user.recipes

        return res.json(user.recipes);

    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while getting your recipes' });
    }
}

export const addRecipeSchema = z.object({
    body: z.object({
        recipe: recipeSchema
    })
});

export const addRecipe = async (req: CustomRequest, res: Response) => {
    const recipe = req.body;

    try {
        const newRecipe = new Recipe({
            ...recipe,
            userId: req.userId
        });

        const savedRecipe = await newRecipe.save();

        const user = await User.findOne({ clerkId: req.userId });

        if (!user) {
            throw new Error('User not found');
        }

        user.recipes.push(savedRecipe.id);

        await user.save();

        return res.json(newRecipe);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while adding recipe' });
    }
}

export const deleteRecipe = async (req: CustomRequest, res: Response) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ message: 'Invalid id' });
    }

    try {
        const user = await User.findOne({ clerkId: req.userId })
            .select('+recipes')
            .exec()
            ;
        if (!user) {
            throw new Error('User not found');
        }
        const newRecipes = user.recipes.filter(recipeId => recipeId !== id);
        user.recipes = newRecipes as any;
        await user.save();

        await Recipe.findByIdAndDelete(id);

        return res.json({ message: 'Recipe deleted' });
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while deleting recipe' });
    }
}

export const getRecipe = async (req: CustomRequest, res: Response) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ message: 'Invalid id' });
    }

    try {
        const recipe = await Recipe.findById(id);

        return res.json(recipe);
    } catch (error: any) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error acoured while getting your recipe' });
    }
}

export { doSomethingByIdSchema }