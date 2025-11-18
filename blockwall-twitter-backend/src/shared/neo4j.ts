import { Neo4jNumeric } from './neo4j.types';

/**
 * Safely converts Neo4j numeric values to a plain JS number.
 * Handles:
 * - null / undefined → 0
 * - number → number
 * - string → parsed number (NaN -> 0)
 * - Neo4j Integer (toNumber) → number
 */
export function asNumberOrNull(value: Neo4jNumeric | undefined): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof (value as { toNumber?: () => number }).toNumber === 'function') {
    try {
      return (value as { toNumber: () => number }).toNumber();
    } catch {
      return null;
    }
  }
  return null;
}
