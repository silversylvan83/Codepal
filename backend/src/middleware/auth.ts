import { RequestHandler } from 'express';

export const auth =
  (required = false): RequestHandler =>
  (req, res, next) => {
    // MVP: no-op. Wire JWT later.
    if (!required) return next();
    return res.status(401).json({ error: 'Auth not configured' });
  };
