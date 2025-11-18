import dotenv from 'dotenv';

dotenv.config();

/**
 * Runtime configuration for the backend.
 * In a production environment, these would be provided via environment variables.
 */
export interface EnvConfig {
  port: number;
  neo4jUri: string;
  neo4jUser: string;
  neo4jPassword: string;
  neo4jDatabase: string;
}

function requireEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const port = Number(requireEnv('PORT', '4000'));

export const env: EnvConfig = {
  port,
  neo4jUri: requireEnv('NEO4J_URI', 'bolt://localhost:7687'),
  neo4jUser: requireEnv('NEO4J_USER', 'neo4j'),
  neo4jPassword: requireEnv('NEO4J_PASSWORD', 'america85'),
  neo4jDatabase: requireEnv('NEO4J_DATABASE', 'twitter-v2-50'),
};
