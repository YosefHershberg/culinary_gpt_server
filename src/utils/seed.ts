import Ingredient from '../api/models/ingredient.model';
import logger from '../config/logger';
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

        logger.info('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

export default seedDatabase;