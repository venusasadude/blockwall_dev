import { RequestHandler } from 'express';

/**
 * Wraps an async Express handler and forwards rejections to `next()`.
 * Avoids repetitive try/catch blocks in route definitions.
 */
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
