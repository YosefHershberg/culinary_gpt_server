import express from 'express';
import { ingredientSuggestionsController } from './controllers/ingredientSuggestionsController';
import userDataRoutes from './routes/userDataRoutes';

const router = express.Router();

router.get('/search', (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'No query provided' });
  }

  setTimeout(() => {
    res.json([
      { id: 400001, name: "Salt" },
      { id: 400003, name: "Pepper" },
      { id: 400002, name: "Sugar" },
      { id: 500094, name: "Flour" },
      { id: 300006, name: "Eggs" },
      { id: 300033, name: "Butter" },
      { id: 300001, name: "Milk" },
      { id: 200009, name: "Garlic" },
      { id: 200008, name: "Onion" },
      { id: 400090, name: "Olive Oil" },
      { id: 400091, name: "Vegetable Oil" }
    ]);
    // res.status(400).json({ message: 'Internal Error. Try again later' });
  }, 1000);
});

router.get('/ingredient-suggestions/:category', ingredientSuggestionsController);

router.use('/user', userDataRoutes)

export default router;
