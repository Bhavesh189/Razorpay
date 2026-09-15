import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info('database.connected', { host: conn.connection.host, database: conn.connection.name });
  } catch (error) {
    logger.error('database.connection.failed', { error });
    process.exit(1);
  }
};
