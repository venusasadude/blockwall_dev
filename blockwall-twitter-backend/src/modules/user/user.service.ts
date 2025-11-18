import { getSession } from '../../config/neo4j';
import { asNumberOrNull } from '../../shared/neo4j';
import { Neo4jNumeric } from '../../shared/neo4j.types';
import { UserDetailResponse, UserProfile, UserTweet } from './user.types';

/**
 * Fetches a user's profile and their tweets + hashtags.
 */
export async function getUserDetail(
  screenName: string,
  limit = 200,
): Promise<UserDetailResponse> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (u:User {screen_name: $screenName})
      OPTIONAL MATCH (u)-[:POSTS]->(t:Tweet)
      OPTIONAL MATCH (t)-[:TAGS]->(h:Hashtag)
      WITH u, t, h
      ORDER BY t.created_at DESC
      LIMIT toInteger($limit)
      RETURN u, t, h
      `,
      { screenName, limit },
    );

    if (result.records.length === 0) {
      return { user: null, tweets: [] };
    }

    // Build user from the first record
    const firstRecord = result.records[0];
    const u = firstRecord.get('u');
    if (!u) {
      return { user: null, tweets: [] };
    }
    const uProps = u.properties as {
      screen_name?: string;
      name?: string;
      followers?: Neo4jNumeric;
      following?: Neo4jNumeric;
      statuses?: Neo4jNumeric;
      location?: string;
      profile_image_url?: string;
      url?: string;
    };

    const userProfile: UserProfile = {
      screen_name: uProps.screen_name ?? '',
      name: uProps.name ?? '',
      followers: asNumberOrNull(uProps.followers),
      following: asNumberOrNull(uProps.following),
      location: uProps.location ?? null,
      profile_image_url: uProps.profile_image_url ?? null,
      statuses: asNumberOrNull(uProps.statuses),
      url: uProps.url ?? null,
    };

    // Aggregate tweets + hashtags
    const tweetsMap = new Map<string, UserTweet>();

    for (const record of result.records) {
      const t = record.get('t');
      const h = record.get('h');

      if (!t) continue;

      const tProps = t.properties as {
        id?: Neo4jNumeric;
        text?: string;
        created_at?: string | number | Date;
        favorites?: Neo4jNumeric;
      };

      const tweetKey = String(tProps.id);

      if (tProps.id && !tweetsMap.has(tweetKey)) {
        const tweet: UserTweet = {
          id: asNumberOrNull(tProps.id) ?? 0,
          text: tProps.text ?? '',
          created_at: tProps.created_at ? new Date(tProps.created_at).toISOString() : '',
          favorites: asNumberOrNull(tProps.favorites) ?? null,
          hashtags: [],
        };
        tweetsMap.set(tweetKey, tweet);
      }

      if (h && h.properties.name && tweetsMap.has(tweetKey)) {
        const tweet = tweetsMap.get(tweetKey)!;
        const hashtagName = h.properties.name ?? '';
        if (!tweet.hashtags.includes(hashtagName)) {
          tweet.hashtags.push(hashtagName);
        }
      }
    }

    return {
      user: userProfile,
      tweets: Array.from(tweetsMap.values()),
    };
  } finally {
    await session.close();
  }
}
