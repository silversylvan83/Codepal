// src/app.js
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import reviewsRouter from "./routes/reviews.js";
import snippetsRouter from "./routes/snippets.js";
import historyRouter from "./routes/history.js";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  const whitelist = new Set(env.CORS_ORIGINS);
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || whitelist.has(origin)) return cb(null, true);
        cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.get("/", (_req, res) => {
    res.json({
      service: "backend",
      provider: env.LLM_PROVIDER,
      model: env.LLM_MODEL,
      time: new Date().toISOString(),
    });
  });

  app.use("/api/reviews", reviewsRouter);
  app.use("/api/snippets", snippetsRouter);
  app.use("/api/history", historyRouter);

  // Preserve your rewrite behavior for GET /api/history (no functional change)
  app.use("/api/history", (req, res, next) => {
    if (req.method.toUpperCase() !== "GET") return next();
    req.url = "/"; // rewrite to /api/history
    historyRouter(req, res, next);
  });

  // final error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error("[error]", err?.message || err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}
