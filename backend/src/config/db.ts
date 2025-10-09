import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB() {
  try {
    console.log('[db] connecting to', env.MONGODB_URI);
    await mongoose.connect(env.MONGODB_URI);
    console.log('[db] connected',
      { name: mongoose.connection.name, host: mongoose.connection.host });

    mongoose.connection.on('error', (e) => {
      console.error('[db] connection error:', e);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('[db] disconnected');
    });
  } catch (err) {
    console.error('[db] initial connection failed:', err);
    process.exit(1);
  }
}
