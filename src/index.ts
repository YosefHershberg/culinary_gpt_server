import app from './app';
import mongoose from 'mongoose';
import env from './lib/env';

const port = env.PORT || 5000;

mongoose.connect(env.MONGODB_URI!).then(() => {
  app.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${port}`);
    /* eslint-enable no-console */
  });
}).catch((error) => {
  console.log('Error connecting to MongoDB');
  throw error;
});
