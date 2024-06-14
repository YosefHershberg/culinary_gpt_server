import express, { Response } from 'express';
import { ingredientSuggestionsController } from './controllers/ingredientSuggestionsController';
import userDataRoutes from './routes/userDataRoutes';
import CustomRequest from '../interfaces/CustomRequest';
import Ingredient from '../models/ingredient';

const router = express.Router();

router.use('/user', userDataRoutes)

router.get('/ingredient-suggestions/:category', ingredientSuggestionsController);

router.get('/search', async (req: CustomRequest, res: Response) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'No query provided' });
  }

  try {
    const ingredients = await Ingredient.find({ name: { $regex: query, $options: 'i' } });
    return res.json(ingredients);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
  
});



export default router;
