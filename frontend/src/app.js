// src/app.js
import express from "express";
import { env } from "./config/env.js";
import reviewsRouter from "./routes/reviews.js";
import snippetsRouter from "./routes/snippets.js";
import historyRouter from "./routes/history.js";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Health/info
  app.get("/", (_req, res) => {
    res.json({
      service: "backend",
      provider: env.LLM_PROVIDER,
      model: env.LLM_MODEL,
      time: new Date().toISOString(),
    });
  });

  // API routes (same-origin; no CORS needed)
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/snippets", snippetsRouter);
  app.use("/api/history", historyRouter);

  // Final error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error("[error]", err?.message || err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}
