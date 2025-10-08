import express from "express";
import cors from "cors";
import { env } from "./config/env";
import reviewsRouter from "./routes/reviews";
import snippetsRouter from "./routes/snippets";
import debugRouter from "./routes/debug";
export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  const whitelist = new Set(env.CORS_ORIGINS);
  app.use(
    cors({
      origin(origin: any, cb: any) {
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
  app.use("/api/debug", debugRouter);

  // final error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("[error]", err?.message || err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}
