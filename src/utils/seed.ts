import Ingredient from '../api/models/ingredient.model';
import * as ingredients from '../data/ingredients';

const seedDatabase = async () => {
    //TODO: Check if the database is already seeded

    try {
        await Ingredient.insertMany([
            ...ingredients.commonProducts,
            ...ingredients.carbProducts,
            ...ingredients.dairyProducts,
            ...ingredients.vegetables,
            ...ingredients.spices,
            ...ingredients.meatProducts,
        ]);

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

export default seedDatabase;