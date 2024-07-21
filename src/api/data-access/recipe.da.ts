import Recipe from "../models/recipe.model";

export const createRecipe = async (userId: string, recipe: Recipe) => {
    try {
        const newRecipe = new Recipe({
            ...recipe,
            userId
        });
        const savedRecipe = await newRecipe.save();
        return savedRecipe;
    } catch (error: any) {
        console.log(error.message);
        throw new Error('An error acoured while creating recipe');
    }
}

export const getRecipe = async (recipeId: string) => {
    try {
        const recipe = await Recipe.findById(recipeId);
        return recipe;
    } catch (error: any) {
        console.log(error.message);
        throw new Error('An error acoured while getting recipe');
    }
}

export const deleteRecipe = async (recipeId: string) => {
    try {
        const deletedRecipe = await Recipe.findByIdAndDelete(recipeId);
        return deletedRecipe;
    } catch (error: any) {
        console.log(error.message);
        throw new Error('An error acoured while deleting recipe');
    }
}