import app from './app';
import env from './config/env';
import logger from './config/logger';
import { connectToDatabase } from './config/database';

const port = env.PORT || 5000;

connectToDatabase().then(() => {
  app.listen(port, () => {
    /* eslint-disable no-console */
    logger.info(`Listening: http://localhost:${port}`);
    /* eslint-enable no-console */
  });
}).catch((error) => {
  logger.error('Error connecting to MongoDB');
  throw error;
});
