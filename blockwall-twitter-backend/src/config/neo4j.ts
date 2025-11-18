import neo4j, { Driver, Session } from 'neo4j-driver';
import { env } from './env';

let driver: Driver | null = null;

/**
 * Returns a singleton Neo4j driver instance.
 * The driver is created lazily on first access.
 */
export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(
      env.neo4jUri,
      neo4j.auth.basic(env.neo4jUser, env.neo4jPassword),
    );
  }
  return driver;
}

/**
 * Creates a new Neo4j session for the configured database.
 * The caller is responsible for closing the session.
 */
export function getSession(): Session {
  const d = getDriver();
  return d.session({ database: env.neo4jDatabase });
}

/**
 * Closes the Neo4j driver if it has been initialized.
 */
export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
