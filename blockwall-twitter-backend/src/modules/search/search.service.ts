import { getSession } from '../../config/neo4j';
import { asNumberOrNull } from '../../shared/neo4j';
import { Neo4jNumeric } from '../../shared/neo4j.types';
import { SearchResponse, UserSearchResult, HashtagSearchResult } from './search.types';

/**
 * Searches users and/or hashtags by exact match.
 *
 * - Users are matched by screen_name (case-insensitive).
 * - Hashtags are matched by name (case-insensitive).
 *
 * At most one user and one hashtag will be returned for a given query.
 */
export async function search(
  userQuery?: string,
  hashtagQuery?: string,
): Promise<SearchResponse> {
  const session = getSession();

  try {
    const [users, hashtags] = await Promise.all([
      userQuery ? searchUsers(session, userQuery) : Promise.resolve([]),
      hashtagQuery ? searchHashtags(session, hashtagQuery) : Promise.resolve([]),
    ]);

    return { users, hashtags };
  } finally {
    await session.close();
  }
}

async function searchUsers(
  session: ReturnType<typeof getSession>,
  q: string,
): Promise<UserSearchResult[]> {
  const result = await session.run(
    `
    MATCH (u:User)
    WHERE toLower(u.screen_name) = toLower($q)
    RETURN
      u.screen_name AS screen_name,
      u.name AS name,
      u.followers AS followers,
      u.following AS following,
      u.location AS location,
      u.profile_image_url AS profile_image_url,
      u.url AS url
    LIMIT 1
    `,
    { q },
  );

  if (result.records.length === 0) {
    return [];
  }

  const record = result.records[0];

  const user: UserSearchResult = {
    screen_name: record.get('screen_name') ?? '',
    name: record.get('name') ?? '',
    followers: asNumberOrNull(record.get('followers') as Neo4jNumeric),
    following: asNumberOrNull(record.get('following') as Neo4jNumeric),
    location: record.get('location') ?? null,
    profile_image_url: record.get('profile_image_url') ?? null,
    url: record.get('url') ?? null,
  };

  return [user];
}

async function searchHashtags(
  session: ReturnType<typeof getSession>,
  q: string,
): Promise<HashtagSearchResult[]> {
  const result = await session.run(
    `
    MATCH (t:Tweet)-[:TAGS]->(h:Hashtag)
    WHERE toLower(h.name) = toLower($q)
    WITH h, count(t) AS usageCount
    ORDER BY usageCount DESC
    LIMIT 1
    RETURN h.name AS name, usageCount
    `,
    { q },
  );

  return result.records.map((record) => ({
    name: record.get('name') ?? '',
    usageCount: asNumberOrNull(record.get('usageCount') as Neo4jNumeric),
  }));
}
