import { CreateUserDBProps } from "../../api/data-access/user.da";
import type { KitchenUtilsModel, IngredientModel } from "../../generated/prisma/models";
import type { RecipeWithImage } from "../../types";
import { userId } from "./mockApp";

export const mockRecipe: RecipeWithImage = {
    image_url: "https://example.com/recipe-image.jpg",
    userId,
    recipe: {
        title: "Classic Spaghetti Carbonara",
        description: "A creamy and savory Italian pasta dish made with eggs, cheese, pancetta, and pepper.",
        ingredients: [
            { ingredient: "200g spaghetti" },
            { ingredient: "100g pancetta" },
            { ingredient: "2 large eggs" },
            { ingredient: "50g grated Parmesan cheese" },
            { ingredient: "2 cloves garlic" },
            { ingredient: "Salt and pepper to taste" },
            { ingredient: "2 tbsp olive oil" }
        ],
        steps: [
            { step: "Boil a large pot of salted water and cook the spaghetti according to package instructions.", time: "10 minutes" },
            { step: "While the pasta is cooking, heat olive oil in a pan and sauté garlic until fragrant.", time: "2 minutes" },
            { step: "Add pancetta to the pan and cook until crispy.", time: "5 minutes" },
            { step: "In a bowl, whisk together the eggs and Parmesan cheese.", time: "2 minutes" },
            { step: "Drain the pasta and add it to the pan with pancetta. Remove from heat.", time: "1 minute" },
            { step: "Quickly mix in the egg and cheese mixture, stirring to create a creamy sauce.", time: "2 minutes" },
            { step: "Season with salt and pepper to taste, and serve immediately.", time: "2 minutes" }
        ],
        time: "20 minutes",
        level: "Easy",
        type: "recipe",
        id: "recipe123",
    }
};

export const mockUser: CreateUserDBProps = {
    userId: 'clerk123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    isSubscribed: false,
};

export const mockUserDoc = {
    id: 'clerk123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-02T00:00:00Z'),
    isSubscribed: false,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
};

export const mockKitchenUtils: Omit<KitchenUtilsModel, 'id' | 'userId'> = {
    stoveTop: true,
    oven: true,
    microwave: false,
    airFryer: false,
    blender: false,
    foodProcessor: false,
    slowCooker: false,
    bbq: true,
    grill: false,
}

export const mockIngredient: IngredientModel = {
    id: '2',
    name: 'Salt',
    category: ['spice'],
    popularity: 5,
    type: ['food'],
};

export const mockIngredients = [mockIngredient];

export const mockMessageResponse = { message: 'Ingredient deleted successfully' };
