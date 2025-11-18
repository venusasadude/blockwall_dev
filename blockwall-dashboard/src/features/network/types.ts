export type GraphNodeType = 'User' | 'Tweet' | 'Hashtag';

export type GraphEdgeType = 'POSTS' | 'TAGS' | 'MENTIONS' | 'FOLLOWS' | 'REPLY_TO' | 'RETWEETS';

export interface GraphNodeBase {
  id: string;
  label: string;
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
  created_at: string;
}

export interface HashtagNode extends GraphNodeBase {
  type: 'Hashtag';
  name: string;
  usageCount?: number;
}

export type GraphNode = UserNode | TweetNode | HashtagNode;

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: GraphEdgeType;
}

export interface NetworkRequestParams {
  user?: string;
  hashtag?: string;
  minFollowers?: number;
  minHashtagUsage?: number;
  limit?: number;
}

export interface NetworkResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
