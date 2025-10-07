import { env } from './config/env';
import { connectDB } from './config/db';
import app from './app';

await connectDB();
app.listen(env.PORT, () => console.log(`CodePal API on :${env.PORT}`));
