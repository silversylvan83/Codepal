import mongoose from 'mongoose';
import { env } from './env';

mongoose.set('strictQuery', true);

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('[db] connected');
  } catch (err) {
    console.error('[db] connection error:', err);
    process.exit(1);
  }
}
