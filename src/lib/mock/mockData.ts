import { CreateUserDBProps } from "../../api/data-access/user.da";
import { IngredientDocument } from "../../api/models/ingredient.model";
import { UserDocument } from "../../api/models/user.model";
import { KitchenUtils, RecipeWithImage } from "../../interfaces";

export const mockRecipe: RecipeWithImage = {
    image_url: "https://example.com/recipe-image.jpg",
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
        id: "recipe123"
    }
};

export const mockUser: CreateUserDBProps = {
    clerkId: 'clerk123',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    isSubscribed: false,
    stripeCustomerId: null,
    stripeSubscriptionId: null
};

export const mockUserDoc = {
    first_name: 'John',
    last_name: 'Doe',
    clerkId: 'clerk123',
    email: 'john.doe@example.com',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-02T00:00:00Z'),
    isSubscribed: false,
} as UserDocument; //Typed like this because UserDocument extends mongoose.Document

export const mockKitchenUtils: KitchenUtils = {
    "Stove Top": true,
    "Oven": true,
    "Microwave": false,
    "Air Fryer": false,
    "Blender": false,
    "Food Processor": false,
    "Slow Cooker": false,
    "BBQ": true,
    "Grill": false,
}

export const mockIngredient = {
    id: '2',
    name: 'Salt',
    category: ['spice'],
    type: ['food'],
} as IngredientDocument; //Typed like this because IngredientDocument extends mongoose.Document

export const mockIngredients = [mockIngredient];

export const mockMessageResponse = { message: 'Ingredient deleted successfully' };

