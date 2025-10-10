import mongoose from 'mongoose';

let conn: Promise<typeof mongoose> | null = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!conn) {
    conn = mongoose.connect(process.env.MONGODB_URI as string, {
      // options optional in v8+
    });
    mongoose.connection.on('error', (e) => console.error('[db] error', e));
  }
  return conn;
}
