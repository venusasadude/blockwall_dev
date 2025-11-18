import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { router as apiRouter } from './routes';

/**
 * Creates and configures the Express application instance.
 * This function is used by the server entrypoint and test harnesses.
 */
export function createApp(): Application {
  const app = express();

  // Core middleware
  app.use(cors());
  app.use(express.json());

  // Simple health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // API routes
  app.use('/api', apiRouter);

  // Centralized error handler
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // In a production system I would use a structured logger (Pino/Winston)
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
