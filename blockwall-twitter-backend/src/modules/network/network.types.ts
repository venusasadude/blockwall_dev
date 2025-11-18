export type GraphNodeType = 'User' | 'Tweet' | 'Hashtag';

export type GraphEdgeType =
  | 'POSTS'
  | 'TAGS'
  | 'MENTIONS'
  | 'FOLLOWS'
  | 'REPLY_TO'
  | 'RETWEETS';

export interface GraphNodeBase {
  id: string; // internal ID like "user:nasa", "tweet:1234567890"
  label: string; // what we display in the graph
  type: GraphNodeType;
}

export interface UserNode extends GraphNodeBase {
  type: 'User';
  screen_name: string;
  name: string;
  followers: number | null;
}

export interface TweetNode extends GraphNodeBase {
  type: 'Tweet';
  text: string;
  created_at: string; // ISO string
}

export interface HashtagNode extends GraphNodeBase {
  type: 'Hashtag';
  name: string;
  usageCount?: number;
}

export type GraphNode = UserNode | TweetNode | HashtagNode;

export interface GraphEdge {
  id: string;
  from: string; // id of source node
  to: string; // id of target node
  type: GraphEdgeType;
}

export interface NetworkRequestParams {
  user?: string; // to focus on this user (screen_name)
  hashtag?: string; // to focus on this hashtag
  minFollowers?: number; // to filter users by follower count
  minHashtagUsage?: number; // to filter hashtags by usage count
  limit?: number; // max tweets to include
}

export interface NetworkResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
