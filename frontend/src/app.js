// src/app.js
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import reviewsRouter from "./routes/reviews.js";
import snippetsRouter from "./routes/snippets.js";
import historyRouter from "./routes/history.js";

const isDualServerDev =
  process.env.NODE_ENV !== "production" &&
  (process.env.ALLOW_LOCAL_CORS === "1" || !!process.env.NEXT_PUBLIC_API_URL);

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // CORS ONLY for local dual-server dev
  if (isDualServerDev) {
    const allow = new Set([
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]);
    app.use(
      cors({
        credentials: true,
        origin(origin, cb) {
          if (!origin) return cb(null, true); // same-origin / server-to-server
          if (allow.has(origin)) return cb(null, true);
          return cb(new Error(`Not allowed by CORS: ${origin}`));
        },
      })
    );
    app.options("*", cors()); // handle preflight
  }

  app.get("/", (_req, res) => {
    res.json({ service: "backend", provider: env.LLM_PROVIDER, model: env.LLM_MODEL, time: new Date().toISOString() });
  });

  app.use("/api/reviews", reviewsRouter);
  app.use("/api/snippets", snippetsRouter);
  app.use("/api/history", historyRouter);

  app.use((err, _req, res, _next) => {
    console.error("[error]", err?.message || err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}
