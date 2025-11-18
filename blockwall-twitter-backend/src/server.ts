import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { closeDriver, getDriver } from './config/neo4j';

async function startServer(): Promise<void> {
  // Ensure Neo4j is reachable before accepting HTTP traffic
  const driver = getDriver();
  const serverInfo = await driver.getServerInfo();
  console.log('Connected to Neo4j', serverInfo.address);

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await closeDriver();
      console.log('Neo4j driver closed. Goodbye!');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
