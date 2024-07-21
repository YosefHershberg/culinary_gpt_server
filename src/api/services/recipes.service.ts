import { createRecipe, deleteRecipe, getRecipe } from "../data-access/recipe.da";
import { getUserDB, getUserEithRecipesDB } from "../data-access/user.da";

export const recipeOperations = {
    getAllUserRecipes: async (userId: string) => {
        const user = await getUserEithRecipesDB(userId)
        return user.recipes
    },

    addRecipe: async (userId: string, recipe: any) => {
        const newRecipe = await createRecipe(userId, recipe)

        const user = await getUserDB(userId)

        user.recipes.push(newRecipe.id as string)

        const pushedRecipe = await user.save()
        return pushedRecipe
    },

    deleteRecipe: async (userId: string, recipeId: string) => {
        await deleteRecipe(recipeId)

        const user = await getUserDB(userId)
        const newRecipes = user.recipes.filter(id => id.toString() !== recipeId)
        user.recipes = newRecipes
        await user.save()
        return { message: 'Recipe deleted' }
    },

    getRecipe: async (recipeId: string) => {
        const recipe = await getRecipe(recipeId)
        return recipe
    }
}