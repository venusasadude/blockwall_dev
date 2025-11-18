/**
 * Minimal typing for Neo4j nodes and numeric values returned by the driver.
 * Shared across all services for consistent, type-safe handling.
 */
export interface Neo4jNode {
  labels: string[];
  properties: Record<string, unknown>;
  identity: {
    toNumber(): number;
  };
}

/**
 * Numeric values we might get from Neo4j:
 * - plain JS number
 * - string (e.g. from some exports)
 * - Neo4j Integer wrapper with toNumber()
 * - null
 */
export type Neo4jNumeric = number | string | { toNumber(): number } | null;
