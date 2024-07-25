import * as recipeOperationsDB from "../data-access/recipe.da";

export const recipeOperations = {
    getAll: async (userId: string) => {
        const recipes = await recipeOperationsDB.getRecipes(userId)
        return recipes
    },

    addRecipe: async (userId: string, recipe: any) => {
        const newRecipe = await recipeOperationsDB.addRecipe(userId, recipe)
        return newRecipe
    },

    deleteRecipe: async (userId: string, recipeId: string) => {
        await recipeOperationsDB.deleteRecipe(recipeId)
        return { message: 'Recipe deleted' }
    },

    getRecipe: async (recipeId: string) => {
        const recipe = await recipeOperationsDB.getRecipe(recipeId)
        return recipe
    },
}
