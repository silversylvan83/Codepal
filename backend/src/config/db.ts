import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Mongo connected:', mongoose.connection.name);
}
