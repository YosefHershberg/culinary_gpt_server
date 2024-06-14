import app from './app';
import mongoose from 'mongoose';
// import seedDatabase from '@/utils/seed';

require('dotenv').config();

const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI!).then(() => {
  app.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${port}`);
    /* eslint-enable no-console */
  });
}).catch((error) => {
  console.log('Error connecting to MongoDB');
  throw error;
});
