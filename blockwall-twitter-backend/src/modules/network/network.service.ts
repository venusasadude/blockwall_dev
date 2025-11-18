import { getSession } from '../../config/neo4j';
import { asNumberOrNull } from '../../shared/neo4j';
import { Neo4jNode, Neo4jNumeric } from '../../shared/neo4j.types';
import {
  GraphNode,
  GraphEdge,
  NetworkRequestParams,
  NetworkResponse,
  UserNode,
  TweetNode,
  HashtagNode,
} from './network.types';

/**
 * Builds a graph around a user or hashtag:
 * - Users who POST tweets
 * - Tweets they created
 * - Hashtags on those tweets
 */
export async function getNetwork(params: NetworkRequestParams): Promise<NetworkResponse> {
  const session = getSession();
  const { user, hashtag, minFollowers = 0, minHashtagUsage = 0, limit = 200 } = params;

  try {
    if (user) {
      return await getUserEgoNetwork(session, user, minFollowers, minHashtagUsage, limit);
    }

    // At this point the route guarantees that hashtag is defined
    return await getHashtagNetwork(
      session,
      hashtag as string,
      minFollowers,
      minHashtagUsage,
      limit,
    );
  } finally {
    await session.close();
  }
}

async function getUserEgoNetwork(
  session: ReturnType<typeof getSession>,
  screenName: string,
  minFollowers: number,
  minHashtagUsage: number,
  limit: number,
): Promise<NetworkResponse> {
  const result = await session.run(
    `
    MATCH (u:User {screen_name: $screenName})
    WHERE coalesce(u.followers, 0) >= toInteger($minFollowers)
    OPTIONAL MATCH (u)-[:POSTS]->(t:Tweet)
    WITH u, t
    ORDER BY t.created_at DESC
    LIMIT toInteger($limit)
  
    // Attach hashtags
    OPTIONAL MATCH (t)-[:TAGS]->(h:Hashtag)
    // Count how many tweets use each hashtag (usage frequency)
    OPTIONAL MATCH (h)<-[:TAGS]-(tAll:Tweet)
    WITH u, t, h, count(DISTINCT tAll) AS hashtagUsage
    WHERE h IS NULL OR hashtagUsage >= toInteger($minHashtagUsage)
  
    // Attach mentioned users
    OPTIONAL MATCH (t)-[:MENTIONS]->(m:User)
    RETURN
      u,
      collect(DISTINCT t) AS tweets,
      collect(DISTINCT h) AS hashtags,
      collect(DISTINCT m) AS mentionedUsers,
      collect(DISTINCT { tweet: t, hashtag: h }) AS tweetHashtagPairs
    `,
    { screenName, minFollowers, minHashtagUsage, limit },
  );  

  if (result.records.length === 0) {
    return { nodes: [], edges: [] };
  }

  const record = result.records[0];
  const u = record.get('u') as Neo4jNode;
  const tweets = record.get('tweets') as Neo4jNode[];
  const mentionedUsers = record.get('mentionedUsers') as Neo4jNode[];
  const tweetHashtagPairs = record.get('tweetHashtagPairs') as {
    tweet: Neo4jNode | null;
    hashtag: Neo4jNode | null;
  }[];

  const nodesMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  // Central user node
  const mainUser = mapUserNode(u);
  nodesMap.set(mainUser.id, mainUser);

  // Tweet nodes + POSTS edges (u -> tweet)
  for (const t of tweets) {
    if (!t) continue;
    const tweetNode = mapTweetNode(t);
    nodesMap.set(tweetNode.id, tweetNode);

    edges.push({
      id: `POSTS:${mainUser.id}->${tweetNode.id}`,
      from: mainUser.id,
      to: tweetNode.id,
      type: 'POSTS',
    });
  }

  // Hashtag nodes + TAGS edges (tweet -> hashtag)
  for (const pair of tweetHashtagPairs) {
    const t = pair.tweet;
    const h = pair.hashtag;
    if (!t || !h) continue;

    const tweetNode = mapTweetNode(t);
    const hashtagNode = mapHashtagNode(h);

    nodesMap.set(tweetNode.id, tweetNode);
    nodesMap.set(hashtagNode.id, hashtagNode);

    edges.push({
      id: `TAGS:${tweetNode.id}->${hashtagNode.id}`,
      from: tweetNode.id,
      to: hashtagNode.id,
      type: 'TAGS',
    });
  }

  // Mentioned users (nodes only)
  for (const m of mentionedUsers) {
    if (!m) continue;
    const mentionedNode = mapUserNode(m);
    nodesMap.set(mentionedNode.id, mentionedNode);
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges,
  };
}

async function getHashtagNetwork(
  session: ReturnType<typeof getSession>,
  hashtag: string,
  minFollowers: number,
  minHashtagUsage: number,
  limit: number,
): Promise<NetworkResponse> {
  const result = await session.run(
    `
    MATCH (h:Hashtag {name: $hashtag})
    // compute global usage of this hashtag
    OPTIONAL MATCH (h)<-[:TAGS]-(tAll:Tweet)
    WITH h, count(DISTINCT tAll) AS usageCount
    WHERE usageCount >= toInteger($minHashtagUsage)
  
    // now get the concrete tweet set for the graph
    MATCH (t:Tweet)-[:TAGS]->(h)
    WITH h, t
    ORDER BY t.created_at DESC
    LIMIT toInteger($limit)
  
    OPTIONAL MATCH (u:User)-[:POSTS]->(t)
    WHERE coalesce(u.followers, 0) >= toInteger($minFollowers)
    RETURN
      h,
      collect(DISTINCT t) AS tweets,
      collect(DISTINCT u) AS users
    `,
    { hashtag, minFollowers, minHashtagUsage, limit },
  );  

  if (result.records.length === 0) {
    return { nodes: [], edges: [] };
  }

  const record = result.records[0];
  const h = record.get('h') as Neo4jNode;
  const tweets = record.get('tweets') as Neo4jNode[];
  const users = record.get('users') as Neo4jNode[];

  const nodesMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  const mainHashtag = mapHashtagNode(h);
  nodesMap.set(mainHashtag.id, mainHashtag);

  // Tweet nodes + TAGS edges (tweet -> hashtag)
  for (const t of tweets) {
    const tweetNode = mapTweetNode(t);
    nodesMap.set(tweetNode.id, tweetNode);

    edges.push({
      id: `TAGS:${tweetNode.id}->${mainHashtag.id}`,
      from: tweetNode.id,
      to: mainHashtag.id,
      type: 'TAGS',
    });
  }

  // User nodes
  for (const u of users) {
    const userNode = mapUserNode(u);
    nodesMap.set(userNode.id, userNode);
  }

  // POSTS edges (user -> tweet) for the included users/tweets
  const postsEdgesResult = await session.run(
    `
    MATCH (u:User)-[p:POSTS]->(t:Tweet)
    WHERE id(u) IN $userIds AND id(t) IN $tweetIds
    RETURN u, t, type(p) AS relType
    `,
    {
      userIds: users.map((u) => u.identity.toNumber()),
      tweetIds: tweets.map((t) => t.identity.toNumber()),
    },
  );

  for (const r of postsEdgesResult.records) {
    const start = r.get('u') as Neo4jNode;
    const end = r.get('t') as Neo4jNode;
    const relType = r.get('relType') as string;

    const fromId = buildNodeId(start);
    const toId = buildNodeId(end);

    edges.push({
      id: `${relType}:${fromId}->${toId}`,
      from: fromId,
      to: toId,
      type: 'POSTS',
    });
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges,
  };
}

function buildNodeId(node: Neo4jNode): string {
  const labels: string[] = node.labels;
  const props = node.properties as {
    screen_name?: string;
    id?: string | number;
    name?: string;
  };

  if (labels.includes('User') && props.screen_name) {
    return `user:${props.screen_name}`;
  }
  if (labels.includes('Tweet') && props.id != null) {
    return `tweet:${props.id}`;
  }
  if (labels.includes('Hashtag') && props.name) {
    return `hashtag:${props.name}`;
  }
  return `node:${node.identity.toNumber()}`;
}

function mapUserNode(node: Neo4jNode): UserNode {
  const props = node.properties as {
    screen_name?: string;
    name?: string;
    followers?: Neo4jNumeric;
  };

  const id = buildNodeId(node);

  return {
    id,
    type: 'User',
    label: props.screen_name || props.name || '(unknown user)',
    screen_name: props.screen_name ?? '',
    name: props.name ?? '',
    followers: asNumberOrNull(props.followers) ?? null,
  };
}

function mapTweetNode(node: Neo4jNode): TweetNode {
  const props = node.properties as {
    id?: string | number;
    text?: string;
    created_at?: string | number | Date;
  };

  const id = buildNodeId(node);
  return {
    id,
    type: 'Tweet',
    label: props.text?.slice(0, 50) ?? '(no text)',
    text: props.text ?? '',
    created_at: props.created_at
      ? new Date(props.created_at as string).toISOString()
      : '',
  };
}

function mapHashtagNode(node: Neo4jNode): HashtagNode {
  const props = node.properties as { name?: string };

  const id = buildNodeId(node);
  const name = props.name ?? '';
  return {
    id,
    type: 'Hashtag',
    label: name ? `#${name}` : '#(unknown)',
    name,
  };
}
