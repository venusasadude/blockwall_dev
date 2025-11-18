import { getSession } from '../../config/neo4j';
import { asNumberOrNull } from '../../shared/neo4j';
import { OverviewResponse, Totals, TopUserByTweets, TopHashtag } from './overview.types';

/**
 * Fetches high-level metrics for the dashboard overview:
 * - total number of users, tweets, hashtags
 * - top 5 users by tweet count
 * - top 10 hashtags by usage
 */
export async function getOverviewData(): Promise<OverviewResponse> {
  const session = getSession();

  try {
    const totals = await fetchTotals(session);
    const topUsersByTweets = await fetchTopUsersByTweets(session);
    const topHashtags = await fetchTopHashtags(session);

    return {
      totals,
      topUsersByTweets,
      topHashtags,
    };
  } finally {
    await session.close();
  }
}

async function fetchTotals(session: ReturnType<typeof getSession>): Promise<Totals> {
  const result = await session.run(
    `
    MATCH (u:User)
    WITH count(u) AS users
    MATCH (t:Tweet)
    WITH users, count(t) AS tweets
    MATCH (h:Hashtag)
    RETURN users, tweets, count(h) AS hashtags
    `,
  );

  const record = result.records[0];

  return {
    users: asNumberOrNull(record.get('users')) ?? 0,
    tweets: asNumberOrNull(record.get('tweets')) ?? 0,
    hashtags: asNumberOrNull(record.get('hashtags')) ?? 0,
  };
}

async function fetchTopUsersByTweets(
  session: ReturnType<typeof getSession>,
): Promise<TopUserByTweets[]> {
  const result = await session.run(
    `
    MATCH (u:User)-[:POSTS]->(t:Tweet)
    WITH u, count(t) AS tweetCount
    ORDER BY tweetCount DESC
    LIMIT 5
    RETURN
      u.screen_name AS screen_name,
      u.name AS name,
      tweetCount,
      u.followers AS followers
    `,
  );

  return result.records.map((record) => ({
    screen_name: record.get('screen_name'),
    name: record.get('name'),
    tweetCount: asNumberOrNull(record.get('tweetCount')) ?? 0,
    followers: asNumberOrNull(record.get('followers')),
  }));
}

async function fetchTopHashtags(
  session: ReturnType<typeof getSession>,
): Promise<TopHashtag[]> {
  const result = await session.run(
    `
    MATCH (t:Tweet)-[:TAGS]->(h:Hashtag)
    WITH h, count(t) AS usageCount
    ORDER BY usageCount DESC
    LIMIT 10
    RETURN h.name AS name, usageCount
    `,
  );

  return result.records.map((record) => ({
    name: record.get('name'),
    usageCount: asNumberOrNull(record.get('usageCount')) ?? 0,
  }));
}
