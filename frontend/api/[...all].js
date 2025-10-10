// frontend/api/[...all].js
import serverless from "serverless-http";
import { createApp } from "../src/app.js";
import { connectDB } from "../src/config/db.js";

// Connect once across cold starts
let dbReady = globalThis._dbReady;
if (!dbReady) dbReady = globalThis._dbReady = connectDB();

const expressApp = createApp();
const serverlessHandler = serverless(expressApp);

// Small helper: set CORS headers
function setCors(res, origin) {
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true"); // turn off if you don’t need cookies
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
}

export default async function handler(req, res) {
  // ------------- CORS GUARD -------------
  const origin = req.headers.origin || "";

  // Production domains we’ll allow:
  // - The deployed domain (VERCEL_URL)
  // - Your custom domain if you set FRONTEND_ORIGIN
  // - Any *.vercel.app (covers Preview builds)
  // - Local dev (localhost:3000) for convenience
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null;
  const custom = process.env.FRONTEND_ORIGIN || null;

  const isAllowed =
    (!!vercelUrl && origin === vercelUrl) ||
    (!!custom && origin === custom) ||
    /\.vercel\.app$/.test(origin) ||
    origin === "http://localhost:3000" ||
    origin === "http://127.0.0.1:3000";

  if (isAllowed && origin) {
    setCors(res, origin);
  }

  // Optional: TEMP wildcard switch if you just want it to work right now.
  // NOTE: Wildcard cannot be used with credentials.
  if (!isAllowed && process.env.ALLOW_CORS_WILDCARD === "1") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
  }

  // Handle preflight quickly
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  // ---------- END CORS GUARD ----------

  await dbReady;
  return serverlessHandler(req, res);
}
